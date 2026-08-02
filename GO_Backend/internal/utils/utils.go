package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
)

var (
	Validate *validator.Validate
	Logger   *zap.Logger
)

func init() {
	Validate = validator.New()
	var err error
	Logger, err = zap.NewDevelopment()
	if err != nil {
		Logger = zap.NewExample()
	}
}

// Password Hashing
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Token Hashing for Database Storage
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// JWT Token Claims
type JWTClaims struct {
	UserID string          `json:"user_id"`
	Email  string          `json:"email"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// Generate Access Token (15 Minutes)
func GenerateAccessToken(userID uuid.UUID, email string, role models.UserRole, secret string) (string, error) {
	claims := JWTClaims{
		UserID: userID.String(),
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)), // 15m expiration
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Generate Opaque Refresh Token
func GenerateRefreshToken() string {
	return uuid.New().String() + "-" + uuid.New().String()
}

func ValidateToken(tokenString string, secret string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

// Struct Validation
func ValidateStruct(s interface{}) []string {
	var errMsgs []string
	err := Validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			errMsgs = append(errMsgs, fmt.Sprintf("Field '%s' failed validation rule '%s'", err.Field(), err.Tag()))
		}
	}
	return errMsgs
}

// Standard Fiber Response Helpers
func SendSuccess(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(dto.ApiResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func SendError(c *fiber.Ctx, statusCode int, message string, errs []string) error {
	if errs == nil {
		errs = []string{message}
	}
	return c.Status(statusCode).JSON(dto.ApiResponse{
		Success: false,
		Message: message,
		Errors:  errs,
	})
}
