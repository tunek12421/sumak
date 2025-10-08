package main

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

var db *sql.DB

type Report struct {
	ID          string    `json:"id"`
	Description string    `json:"description"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	PhotoURL    string    `json:"photo_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateReportRequest struct {
	Description string  `json:"description" binding:"required"`
	Latitude    float64 `json:"latitude" binding:"required"`
	Longitude   float64 `json:"longitude" binding:"required"`
	Photo       string  `json:"photo" binding:"required"` // base64 encoded image
}

func main() {
	// Initialize database
	if err := initDB(); err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	// Create uploads directory if it doesn't exist
	uploadsDir := getUploadsDir()
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Fatalf("Failed to create uploads directory: %v", err)
	}

	// Setup Gin router
	router := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	router.Use(cors.New(config))

	// Serve static files (uploaded photos)
	router.Static("/uploads", uploadsDir)

	// Routes
	api := router.Group("/api")
	{
		api.POST("/reports", createReport)
		api.GET("/reports", getReports)
		api.GET("/reports/:id", getReport)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "database": "connected"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDB() error {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Default values
	if dbHost == "" {
		dbHost = "localhost"
	}
	if dbPort == "" {
		dbPort = "5432"
	}
	if dbUser == "" {
		dbUser = "postgres"
	}
	if dbPassword == "" {
		dbPassword = "postgres"
	}
	if dbName == "" {
		dbName = "sumate"
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}

	// Test connection with retry
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		err = db.Ping()
		if err == nil {
			break
		}
		log.Printf("Database connection attempt %d/%d failed: %v", i+1, maxRetries, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return fmt.Errorf("failed to connect to database after %d attempts: %v", maxRetries, err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Println("Database connected successfully")
	return nil
}

func getUploadsDir() string {
	uploadsDir := os.Getenv("UPLOADS_DIR")
	if uploadsDir == "" {
		uploadsDir = "./uploads"
	}
	return uploadsDir
}

func getBaseURL() string {
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	return baseURL
}

func createReport(c *gin.Context) {
	var req CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate coordinates
	if req.Latitude < -90 || req.Latitude > 90 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid latitude"})
		return
	}
	if req.Longitude < -180 || req.Longitude > 180 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude"})
		return
	}

	// Save photo to filesystem
	photoPath, err := savePhoto(req.Photo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save photo: %v", err)})
		return
	}

	// Create report in database
	reportID := uuid.New().String()
	query := `
		INSERT INTO reports (id, description, latitude, longitude, photo_path)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at
	`

	var createdAt time.Time
	err = db.QueryRow(query, reportID, req.Description, req.Latitude, req.Longitude, photoPath).Scan(&createdAt)
	if err != nil {
		// Clean up uploaded photo if database insert fails
		os.Remove(filepath.Join(getUploadsDir(), photoPath))
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save report: %v", err)})
		return
	}

	// Build photo URL
	photoURL := fmt.Sprintf("%s/uploads/%s", getBaseURL(), photoPath)

	report := Report{
		ID:          reportID,
		Description: req.Description,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		PhotoURL:    photoURL,
		CreatedAt:   createdAt,
	}

	c.JSON(http.StatusCreated, report)
}

func getReports(c *gin.Context) {
	query := `
		SELECT id, description, latitude, longitude, photo_path, created_at
		FROM reports
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch reports: %v", err)})
		return
	}
	defer rows.Close()

	var reports []Report
	baseURL := getBaseURL()

	for rows.Next() {
		var report Report
		var photoPath string

		err := rows.Scan(&report.ID, &report.Description, &report.Latitude, &report.Longitude, &photoPath, &report.CreatedAt)
		if err != nil {
			log.Printf("Error scanning report: %v", err)
			continue
		}

		report.PhotoURL = fmt.Sprintf("%s/uploads/%s", baseURL, photoPath)
		reports = append(reports, report)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error reading reports: %v", err)})
		return
	}

	if reports == nil {
		reports = []Report{}
	}

	c.JSON(http.StatusOK, reports)
}

func getReport(c *gin.Context) {
	id := c.Param("id")

	query := `
		SELECT id, description, latitude, longitude, photo_path, created_at
		FROM reports
		WHERE id = $1
	`

	var report Report
	var photoPath string

	err := db.QueryRow(query, id).Scan(&report.ID, &report.Description, &report.Latitude, &report.Longitude, &photoPath, &report.CreatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch report: %v", err)})
		return
	}

	report.PhotoURL = fmt.Sprintf("%s/uploads/%s", getBaseURL(), photoPath)

	c.JSON(http.StatusOK, report)
}

func savePhoto(base64Photo string) (string, error) {
	// Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
	if idx := strings.Index(base64Photo, ","); idx != -1 {
		base64Photo = base64Photo[idx+1:]
	}

	// Decode base64
	photoData, err := base64.StdEncoding.DecodeString(base64Photo)
	if err != nil {
		return "", fmt.Errorf("invalid base64 data: %v", err)
	}

	// Validate file size (max 10MB)
	if len(photoData) > 10*1024*1024 {
		return "", fmt.Errorf("file too large (max 10MB)")
	}

	// Detect image type and set extension
	ext := ".jpg"
	contentType := http.DetectContentType(photoData)
	switch contentType {
	case "image/jpeg":
		ext = ".jpg"
	case "image/png":
		ext = ".png"
	case "image/gif":
		ext = ".gif"
	case "image/webp":
		ext = ".webp"
	default:
		// Default to jpg if can't detect
		ext = ".jpg"
	}

	// Generate unique filename with timestamp and UUID
	filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), uuid.New().String()[:8], ext)

	// Create full path
	fullPath := filepath.Join(getUploadsDir(), filename)

	// Write file
	err = os.WriteFile(fullPath, photoData, 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write file: %v", err)
	}

	// Return just the filename (not the full path)
	return filename, nil
}

// Cleanup function to remove orphaned photos (optional, can be called periodically)
func cleanupOrphanedPhotos() error {
	uploadsDir := getUploadsDir()

	// Get all photo filenames from database
	query := "SELECT photo_path FROM reports"
	rows, err := db.Query(query)
	if err != nil {
		return err
	}
	defer rows.Close()

	dbPhotos := make(map[string]bool)
	for rows.Next() {
		var photoPath string
		if err := rows.Scan(&photoPath); err != nil {
			continue
		}
		dbPhotos[photoPath] = true
	}

	// Read all files in uploads directory
	files, err := os.ReadDir(uploadsDir)
	if err != nil {
		return err
	}

	// Delete files not in database
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if !dbPhotos[file.Name()] {
			filePath := filepath.Join(uploadsDir, file.Name())
			log.Printf("Removing orphaned file: %s", filePath)
			os.Remove(filePath)
		}
	}

	return nil
}
