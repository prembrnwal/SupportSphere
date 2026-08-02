package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"support-system-backend/internal/config"
	"support-system-backend/internal/models"
	"support-system-backend/internal/utils"
)

func ConnectDB(cfg *config.Config) (*gorm.DB, error) {
	var dsn string
	if cfg.DatabaseURL != "" {
		dsn = cfg.DatabaseURL
	} else {
		dsn = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
			cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
		)
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	log.Println("Database connection established successfully")

	// Enable uuid-ossp & pgcrypto extensions in postgres
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")

	// Auto Migrate models
	if err := db.AutoMigrate(&models.User{}, &models.Ticket{}, &models.RefreshToken{}, &models.AuditLog{}); err != nil {
		return nil, fmt.Errorf("failed to auto migrate models: %w", err)
	}

	log.Println("Database migration completed")

	// Seed default admin user
	if err := seedDefaultUsers(db); err != nil {
		log.Printf("Warning: failed to seed default users: %v\n", err)
	}

	return db, nil
}

func seedDefaultUsers(db *gorm.DB) error {
	// Seed Admin User if not existing
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, err := utils.HashPassword("AdminPassword123!")
		if err != nil {
			return err
		}
		admin := models.User{
			Name:     "System Admin",
			Email:    "admin@helpdesk.com",
			Password: hashedPassword,
			Role:     models.RoleAdmin,
		}
		if err := db.Create(&admin).Error; err != nil {
			return err
		}
		log.Println("Seeded default admin user (email: admin@helpdesk.com, pass: AdminPassword123!)")
	}

	return nil
}
