package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"support-system-backend/internal/auth/repository"
	"support-system-backend/internal/config"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
	"support-system-backend/internal/utils"
)

type AuthService interface {
	Register(req *dto.RegisterRequest, ip string, userAgent string) (*dto.AuthResponse, error)
	Login(req *dto.LoginRequest, ip string, userAgent string) (*dto.AuthResponse, error)
	RefreshToken(req *dto.RefreshTokenRequest, ip string, userAgent string) (*dto.AuthResponse, error)
	Logout(refreshToken string, userID string, ip string, userAgent string) error
	ForgotPassword(req *dto.ForgotPasswordRequest, ip string, userAgent string) error
	ResetPassword(req *dto.ResetPasswordRequest, ip string, userAgent string) error
	GetProfile(userID string) (*models.User, error)
}

type authService struct {
	repo repository.AuthRepository
	cfg  *config.Config
}

func NewAuthService(repo repository.AuthRepository, cfg *config.Config) AuthService {
	return &authService{repo: repo, cfg: cfg}
}

func (s *authService) Register(req *dto.RegisterRequest, ip string, userAgent string) (*dto.AuthResponse, error) {
	existing, _ := s.repo.FindByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email address is already registered")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	role := req.Role
	if role == "" {
		role = models.RoleCustomer
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     role,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Audit Log
	s.repo.LogAuditAction(&user.ID, "USER_REGISTER", ip, userAgent, fmt.Sprintf("User registered with role %s", user.Role))

	// Generate Access Token (15m) & Refresh Token (7d)
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, s.cfg.JWTSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshTokenRaw := utils.GenerateRefreshToken()
	refreshTokenHash := utils.HashToken(refreshTokenRaw)

	refreshTokenModel := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: refreshTokenHash,
		IPAddress: ip,
		UserAgent: userAgent,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days expiration
	}
	s.repo.SaveRefreshToken(refreshTokenModel)

	return &dto.AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshTokenRaw,
		ExpiresIn:    900, // 15 minutes in seconds
	}, nil
}

func (s *authService) Login(req *dto.LoginRequest, ip string, userAgent string) (*dto.AuthResponse, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		s.repo.LogAuditAction(nil, "LOGIN_FAILED", ip, userAgent, fmt.Sprintf("Failed login for unknown email: %s", req.Email))
		return nil, errors.New("invalid email or password")
	}

	// Check Account Lockout
	if user.LockedUntil != nil && user.LockedUntil.After(time.Now()) {
		s.repo.LogAuditAction(&user.ID, "LOGIN_LOCKED", ip, userAgent, "Attempted login on locked account")
		return nil, fmt.Errorf("account is temporarily locked due to too many failed attempts. Try again after %s", user.LockedUntil.Format("15:04:05 MST"))
	}

	// Verify Password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		s.repo.RecordFailedAttempt(user)
		s.repo.LogAuditAction(&user.ID, "LOGIN_FAILED", ip, userAgent, "Incorrect password entered")
		return nil, errors.New("invalid email or password")
	}

	// Reset Failed Attempts on Success
	s.repo.ResetFailedAttempts(user)
	s.repo.LogAuditAction(&user.ID, "LOGIN_SUCCESS", ip, userAgent, "User logged in successfully")

	// Generate Access Token & Refresh Token
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, s.cfg.JWTSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshTokenRaw := utils.GenerateRefreshToken()
	refreshTokenHash := utils.HashToken(refreshTokenRaw)

	refreshTokenModel := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: refreshTokenHash,
		IPAddress: ip,
		UserAgent: userAgent,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	s.repo.SaveRefreshToken(refreshTokenModel)

	return &dto.AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshTokenRaw,
		ExpiresIn:    900,
	}, nil
}

func (s *authService) RefreshToken(req *dto.RefreshTokenRequest, ip string, userAgent string) (*dto.AuthResponse, error) {
	tokenHash := utils.HashToken(req.RefreshToken)
	storedToken, err := s.repo.FindRefreshToken(tokenHash)
	if err != nil {
		return nil, errors.New("invalid, revoked, or expired refresh token")
	}

	user, err := s.repo.FindByID(storedToken.UserID.String())
	if err != nil {
		return nil, errors.New("user account associated with token not found")
	}

	// Revoke Old Refresh Token (Refresh Token Rotation)
	s.repo.RevokeRefreshToken(tokenHash)

	// Issue New Refresh Token & Access Token
	newAccessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, s.cfg.JWTSecret)
	if err != nil {
		return nil, err
	}

	newRefreshTokenRaw := utils.GenerateRefreshToken()
	newRefreshTokenHash := utils.HashToken(newRefreshTokenRaw)

	newRefreshTokenModel := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: newRefreshTokenHash,
		IPAddress: ip,
		UserAgent: userAgent,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	s.repo.SaveRefreshToken(newRefreshTokenModel)
	s.repo.LogAuditAction(&user.ID, "TOKEN_REFRESH", ip, userAgent, "Tokens rotated successfully")

	return &dto.AuthResponse{
		User:         *user,
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshTokenRaw,
		ExpiresIn:    900,
	}, nil
}

func (s *authService) Logout(refreshToken string, userID string, ip string, userAgent string) error {
	if refreshToken != "" {
		tokenHash := utils.HashToken(refreshToken)
		s.repo.RevokeRefreshToken(tokenHash)
	}

	if userID != "" {
		parsedID, err := uuid.Parse(userID)
		if err == nil {
			s.repo.RevokeAllUserRefreshTokens(parsedID)
			s.repo.LogAuditAction(&parsedID, "USER_LOGOUT", ip, userAgent, "User logged out")
		}
	}

	return nil
}

func (s *authService) ForgotPassword(req *dto.ForgotPasswordRequest, ip string, userAgent string) error {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		// Return success silently to prevent email enumeration attack
		return nil
	}

	resetToken := uuid.New().String()
	expiresAt := time.Now().Add(1 * time.Hour)
	s.repo.SavePasswordResetToken(user.ID, resetToken, expiresAt)
	s.repo.LogAuditAction(&user.ID, "FORGOT_PASSWORD_REQUESTED", ip, userAgent, "Reset token generated")

	utils.Logger.Info("Password reset token generated",
		zap.String("email", user.Email),
		zap.String("token", resetToken),
	)

	return nil
}

func (s *authService) ResetPassword(req *dto.ResetPasswordRequest, ip string, userAgent string) error {
	user, err := s.repo.FindByPasswordResetToken(req.Token)
	if err != nil {
		return errors.New("invalid or expired password reset token")
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	user.Password = hashedPassword
	user.PasswordResetToken = ""
	user.PasswordResetExpiresAt = nil

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	s.repo.RevokeAllUserRefreshTokens(user.ID)
	s.repo.LogAuditAction(&user.ID, "PASSWORD_RESET_SUCCESS", ip, userAgent, "Password reset completed")

	return nil
}

func (s *authService) GetProfile(userID string) (*models.User, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}
