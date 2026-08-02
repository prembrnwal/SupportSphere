package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	AppPort     string `mapstructure:"APP_PORT"`
	AppEnv      string `mapstructure:"APP_ENV"`
	DatabaseURL string `mapstructure:"DATABASE_URL"`
	DBHost      string `mapstructure:"DB_HOST"`
	DBPort      string `mapstructure:"DB_PORT"`
	DBUser      string `mapstructure:"DB_USER"`
	DBPassword  string `mapstructure:"DB_PASSWORD"`
	DBName      string `mapstructure:"DB_NAME"`
	DBSSLMode   string `mapstructure:"DB_SSLMODE"`
	JWTSecret   string `mapstructure:"JWT_SECRET"`
	JWTExpiryHr int    `mapstructure:"JWT_EXPIRY_HOURS"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Default fallback values
	viper.SetDefault("APP_PORT", "8080")
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "support_system_db")
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("JWT_SECRET", "super-secret-jwt-key-change-in-production")
	viper.SetDefault("JWT_EXPIRY_HOURS", 24)

	if err := viper.ReadInConfig(); err != nil {
		log.Println("No .env file found, using environment variables and defaults")
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
