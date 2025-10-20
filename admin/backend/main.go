package main

import (
	"database/sql"
	"log"
	"math"
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

type ReportPoint struct {
	Latitude  float64
	Longitude float64
	ID        string
}

// Calcula la distancia en kilómetros entre dos puntos GPS usando la fórmula de Haversine
func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371 // Radio de la Tierra en km

	// Convertir grados a radianes
	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	// Fórmula de Haversine
	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}

// Agrupa reportes por proximidad geográfica (clustering)
func clusterReports(reports []ReportPoint, radiusKm float64) []ZoneStats {
	if len(reports) == 0 {
		return []ZoneStats{}
	}

	visited := make(map[int]bool)
	clusters := []ZoneStats{}

	for i, report := range reports {
		if visited[i] {
			continue
		}

		// Crear nuevo cluster
		cluster := ZoneStats{
			Latitude:  report.Latitude,
			Longitude: report.Longitude,
			Count:     1,
		}
		visited[i] = true

		// Buscar reportes cercanos
		var sumLat, sumLon float64
		sumLat = report.Latitude
		sumLon = report.Longitude

		for j, other := range reports {
			if visited[j] {
				continue
			}

			distance := haversineDistance(report.Latitude, report.Longitude, other.Latitude, other.Longitude)
			if distance <= radiusKm {
				cluster.Count++
				sumLat += other.Latitude
				sumLon += other.Longitude
				visited[j] = true
			}
		}

		// Calcular centroide del cluster
		cluster.Latitude = sumLat / float64(cluster.Count)
		cluster.Longitude = sumLon / float64(cluster.Count)

		clusters = append(clusters, cluster)
	}

	// Ordenar clusters por cantidad de reportes (descendente)
	for i := 0; i < len(clusters)-1; i++ {
		for j := i + 1; j < len(clusters); j++ {
			if clusters[j].Count > clusters[i].Count {
				clusters[i], clusters[j] = clusters[j], clusters[i]
			}
		}
	}

	return clusters
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

	// CORS configuration - SECURITY: Restrict to known origins
	config := cors.DefaultConfig()

	// Production origins
	config.AllowOrigins = []string{
		"https://admin.zta.148.230.91.96.nip.io",
	}

	// Allow localhost only in development
	if os.Getenv("ENV") == "development" {
		config.AllowOrigins = append(config.AllowOrigins, "http://localhost:3001")
	}

	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Routes (temporarily without auth)
	r.GET("/health", healthCheck)

	// Admin API routes with prefix
	adminAPI := r.Group("/admin-api")
	{
		adminAPI.GET("/heatmap", getHeatmapData)
		adminAPI.GET("/reports", getAllReports)
		adminAPI.GET("/stats", getStats)
	}

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
		log.Printf("Database error in getHeatmapData: %v", err)
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
		log.Printf("Database error in getAllReports: %v", err)
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

	// Top zones (clustered by geographical proximity)
	rows, err = db.Query(`
		SELECT latitude, longitude
		FROM reports
	`)
	if err == nil {
		defer rows.Close()
		var allReports []ReportPoint
		for rows.Next() {
			var report ReportPoint
			rows.Scan(&report.Latitude, &report.Longitude)
			allReports = append(allReports, report)
		}

		// Realizar clustering con radio de 1.5 km
		clusters := clusterReports(allReports, 1.5)

		// Tomar solo los top 10 clusters
		maxClusters := 10
		if len(clusters) < maxClusters {
			maxClusters = len(clusters)
		}

		for i := 0; i < maxClusters; i++ {
			clusters[i].Area = "Zona " + string(rune(65+i)) // A, B, C...
			stats.TopZones = append(stats.TopZones, clusters[i])
		}
	}

	c.JSON(http.StatusOK, stats)
}
