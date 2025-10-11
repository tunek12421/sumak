package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

type HeatmapPoint struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lng"`
	Intensity int     `json:"intensity"`
}

type Report struct {
	ID          string    `json:"id"`
	Description string    `json:"description"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	PhotoURL    string    `json:"photo_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type Stats struct {
	TotalReports int            `json:"total_reports"`
	Today        int            `json:"today"`
	ThisWeek     int            `json:"this_week"`
	ThisMonth    int            `json:"this_month"`
	ByDay        []DayStats     `json:"by_day"`
	TopZones     []ZoneStats    `json:"top_zones"`
}

type DayStats struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type ZoneStats struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Count     int     `json:"count"`
	Area      string  `json:"area"`
}

func main() {
	// Database connection
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	connStr := "host=" + dbHost + " port=" + dbPort + " user=" + dbUser +
		" password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"

	var err error
	for i := 0; i < 30; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			err = db.Ping()
			if err == nil {
				break
			}
		}
		log.Printf("Waiting for database... (%d/30)\n", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Gin setup
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Routes (temporarily without auth)
	r.GET("/health", healthCheck)
	r.GET("/api/heatmap", getHeatmapData)
	r.GET("/api/reports", getAllReports)
	r.GET("/api/stats", getStats)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Admin server starting on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func healthCheck(c *gin.Context) {
	err := db.Ping()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":   "error",
			"database": "disconnected",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "ok",
		"database": "connected",
	})
}

func getHeatmapData(c *gin.Context) {
	query := `
		SELECT latitude, longitude, COUNT(*) as intensity
		FROM reports
		GROUP BY latitude, longitude
		ORDER BY intensity DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var points []HeatmapPoint
	for rows.Next() {
		var point HeatmapPoint
		err := rows.Scan(&point.Latitude, &point.Longitude, &point.Intensity)
		if err != nil {
			continue
		}
		points = append(points, point)
	}

	c.JSON(http.StatusOK, points)
}

func getAllReports(c *gin.Context) {
	query := `
		SELECT id, description, latitude, longitude, photo_path, created_at
		FROM reports
		ORDER BY created_at DESC
		LIMIT 1000
	`

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	var reports []Report
	for rows.Next() {
		var report Report
		var photoPath string
		err := rows.Scan(&report.ID, &report.Description, &report.Latitude,
			&report.Longitude, &photoPath, &report.CreatedAt)
		if err != nil {
			continue
		}
		report.PhotoURL = baseURL + "/uploads/" + photoPath
		reports = append(reports, report)
	}

	c.JSON(http.StatusOK, reports)
}

func getStats(c *gin.Context) {
	var stats Stats

	// Total reports
	db.QueryRow("SELECT COUNT(*) FROM reports").Scan(&stats.TotalReports)

	// Today
	db.QueryRow(`
		SELECT COUNT(*) FROM reports
		WHERE DATE(created_at) = CURRENT_DATE
	`).Scan(&stats.Today)

	// This week
	db.QueryRow(`
		SELECT COUNT(*) FROM reports
		WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
	`).Scan(&stats.ThisWeek)

	// This month
	db.QueryRow(`
		SELECT COUNT(*) FROM reports
		WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
	`).Scan(&stats.ThisMonth)

	// Reports by day (last 30 days)
	rows, err := db.Query(`
		SELECT DATE(created_at) as date, COUNT(*) as count
		FROM reports
		WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var day DayStats
			rows.Scan(&day.Date, &day.Count)
			stats.ByDay = append(stats.ByDay, day)
		}
	}

	// Top zones (clustered by proximity)
	rows, err = db.Query(`
		SELECT
			ROUND(CAST(latitude AS numeric), 3) as lat,
			ROUND(CAST(longitude AS numeric), 3) as lng,
			COUNT(*) as count
		FROM reports
		GROUP BY lat, lng
		HAVING COUNT(*) > 1
		ORDER BY count DESC
		LIMIT 10
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var zone ZoneStats
			rows.Scan(&zone.Latitude, &zone.Longitude, &zone.Count)
			zone.Area = "Zona " + string(rune(65+len(stats.TopZones))) // A, B, C...
			stats.TopZones = append(stats.TopZones, zone)
		}
	}

	c.JSON(http.StatusOK, stats)
}
