package handler

import (
	"github.com/gofiber/fiber/v2"
	"support-system-backend/internal/auth/service"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/utils"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with CUSTOMER or ADMIN role
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register Payload"
// @Success 201 {object} dto.ApiResponse{data=dto.AuthResponse}
// @Failure 400 {object} dto.ApiResponse
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	res, err := h.authService.Register(&req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusCreated, "User registered successfully", res)
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return Access Token & Refresh Token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login Payload"
// @Success 200 {object} dto.ApiResponse{data=dto.AuthResponse}
// @Failure 401 {object} dto.ApiResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	res, err := h.authService.Login(&req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Login successful", res)
}

// RefreshToken godoc
// @Summary Refresh Access Token
// @Description Rotate refresh token and return new 15-minute access token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshTokenRequest true "Refresh Token Payload"
// @Success 200 {object} dto.ApiResponse{data=dto.AuthResponse}
// @Failure 401 {object} dto.ApiResponse
// @Router /api/v1/auth/refresh-token [post]
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var req dto.RefreshTokenRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	res, err := h.authService.RefreshToken(&req, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Token refreshed successfully", res)
}

// Logout godoc
// @Summary Logout user
// @Description Revoke user refresh tokens and terminate session
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshTokenRequest false "Logout Payload"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req dto.RefreshTokenRequest
	_ = c.BodyParser(&req)

	userIDRaw := c.Locals("user_id")
	userID := ""
	if userIDRaw != nil {
		userID = userIDRaw.(string)
	}

	_ = h.authService.Logout(req.RefreshToken, userID, c.IP(), c.Get("User-Agent"))
	return utils.SendSuccess(c, fiber.StatusOK, "Logged out successfully", nil)
}

// ForgotPassword godoc
// @Summary Request Password Reset Token
// @Description Send password reset token/link for verified account
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.ForgotPasswordRequest true "Forgot Password Payload"
// @Success 200 {object} dto.ApiResponse
// @Router /api/v1/auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req dto.ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	_ = h.authService.ForgotPassword(&req, c.IP(), c.Get("User-Agent"))
	return utils.SendSuccess(c, fiber.StatusOK, "If an account with that email exists, password reset instructions have been generated.", nil)
}

// ResetPassword godoc
// @Summary Reset Password using Reset Token
// @Description Update user password using token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.ResetPasswordRequest true "Reset Password Payload"
// @Success 200 {object} dto.ApiResponse
// @Failure 400 {object} dto.ApiResponse
// @Router /api/v1/auth/reset-password [post]
func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req dto.ResetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	if err := h.authService.ResetPassword(&req, c.IP(), c.Get("User-Agent")); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Password reset successfully. Please sign in with your new password.", nil)
}

// GetMe godoc
// @Summary Get current logged-in user profile
// @Description Get current logged-in user info from JWT
// @Tags User
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=models.User}
// @Failure 401 {object} dto.ApiResponse
// @Router /api/v1/me [get]
func (h *AuthHandler) GetMe(c *fiber.Ctx) error {
	userIDRaw := c.Locals("user_id")
	if userIDRaw == nil {
		return utils.SendError(c, fiber.StatusUnauthorized, "Unauthorized", nil)
	}

	userID := userIDRaw.(string)
	user, err := h.authService.GetProfile(userID)
	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "User profile retrieved", user)
}
