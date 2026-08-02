package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"

	_ "support-system-backend/docs"
	"support-system-backend/internal/config"
	"support-system-backend/internal/database"
	"support-system-backend/internal/middleware"
	"support-system-backend/internal/routes"
)

// @title Support Management System API
// @version 1.0
// @description Production-ready REST API for Support Management System built with Go & Fiber
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// 1. Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// 2. Connect Database
	db, err := database.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	}

	// 3. Initialize Fiber App
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.GlobalErrorHandler,
		AppName:      "Support Management System API v1.0",
	})

	// 4. Global Middlewares (CORS, Recover, Logger)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
	}))
	app.Use(recover.New())
	app.Use(middleware.RequestLogger())

	// 5. Register Routes
	routes.SetupRoutes(app, db, cfg)

	// 6. Start Fiber Server
	addr := ":" + cfg.AppPort
	log.Printf("Server running on port %s (env: %s)", cfg.AppPort, cfg.AppEnv)
	log.Printf("Swagger documentation available at http://localhost:%s/swagger/", cfg.AppPort)

	if err := app.Listen(addr); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}
}
