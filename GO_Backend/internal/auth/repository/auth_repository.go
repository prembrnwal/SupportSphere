package repository

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"support-system-backend/internal/models"
)

type AuthRepository interface {
	CreateUser(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
	UpdateUser(user *models.User) error
	RecordFailedAttempt(user *models.User) error
	ResetFailedAttempts(user *models.User) error
	SavePasswordResetToken(userID uuid.UUID, token string, expiresAt time.Time) error
	FindByPasswordResetToken(token string) (*models.User, error)
	SaveRefreshToken(token *models.RefreshToken) error
	FindRefreshToken(tokenHash string) (*models.RefreshToken, error)
	RevokeRefreshToken(tokenHash string) error
	RevokeAllUserRefreshTokens(userID uuid.UUID) error
	LogAuditAction(userID *uuid.UUID, action string, ip string, userAgent string, details string) error
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *authRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("LOWER(email) = LOWER(?)", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) FindByID(id string) (*models.User, error) {
	var user models.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *authRepository) RecordFailedAttempt(user *models.User) error {
	user.FailedLoginAttempts++
	if user.FailedLoginAttempts >= 5 {
		lockTime := time.Now().Add(15 * time.Minute)
		user.LockedUntil = &lockTime
	}
	return r.db.Save(user).Error
}

func (r *authRepository) ResetFailedAttempts(user *models.User) error {
	now := time.Now()
	user.FailedLoginAttempts = 0
	user.LockedUntil = nil
	user.LastLoginAt = &now
	return r.db.Save(user).Error
}

func (r *authRepository) SavePasswordResetToken(userID uuid.UUID, token string, expiresAt time.Time) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"password_reset_token":      token,
		"password_reset_expires_at": expiresAt,
	}).Error
}

func (r *authRepository) FindByPasswordResetToken(token string) (*models.User, error) {
	var user models.User
	err := r.db.Where("password_reset_token = ? AND password_reset_expires_at > ?", token, time.Now()).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) SaveRefreshToken(token *models.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *authRepository) FindRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	err := r.db.Where("token_hash = ? AND is_revoked = false AND expires_at > ?", tokenHash, time.Now()).First(&token).Error
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *authRepository) RevokeRefreshToken(tokenHash string) error {
	return r.db.Model(&models.RefreshToken{}).Where("token_hash = ?", tokenHash).Update("is_revoked", true).Error
}

func (r *authRepository) RevokeAllUserRefreshTokens(userID uuid.UUID) error {
	return r.db.Model(&models.RefreshToken{}).Where("user_id = ?", userID).Update("is_revoked", true).Error
}

func (r *authRepository) LogAuditAction(userID *uuid.UUID, action string, ip string, userAgent string, details string) error {
	audit := &models.AuditLog{
		UserID:    userID,
		Action:    action,
		IPAddress: ip,
		UserAgent: userAgent,
		Details:   details,
	}
	return r.db.Create(audit).Error
}
