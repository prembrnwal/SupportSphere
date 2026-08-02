package dto

import (
	"time"

	"github.com/google/uuid"
	"support-system-backend/internal/models"
)

// Standard API Response Wrappers
type ApiResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Errors  []string    `json:"errors,omitempty"`
}

type PaginationMeta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalItems int64 `json:"total_items"`
	TotalPages int   `json:"total_pages"`
}

type PaginatedResponse struct {
	Items      interface{}    `json:"items"`
	Pagination PaginationMeta `json:"pagination"`
}

// Auth DTOs
type RegisterRequest struct {
	Name     string          `json:"name" validate:"required,min=2,max=100"`
	Email    string          `json:"email" validate:"required,email"`
	Password string          `json:"password" validate:"required,min=6"`
	Role     models.UserRole `json:"role" validate:"omitempty,oneof=ADMIN CUSTOMER"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	User         models.User `json:"user"`
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token,omitempty"`
	ExpiresIn    int         `json:"expires_in"` // Access token expiration in seconds (900s = 15m)
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Token           string `json:"token" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=NewPassword"`
}

// User DTOs
type UpdateUserRequest struct {
	Name      string          `json:"name" validate:"omitempty,min=2,max=100"`
	Role      models.UserRole `json:"role" validate:"omitempty,oneof=ADMIN CUSTOMER"`
	AvatarURL string          `json:"avatar_url" validate:"omitempty,url"`
}

// Ticket DTOs
type CreateTicketRequest struct {
	Title       string                `json:"title" validate:"required,min=3,max=255"`
	Description string                `json:"description" validate:"required,min=5"`
	Category    string                `json:"category" validate:"omitempty"`
	Priority    models.TicketPriority `json:"priority" validate:"omitempty,oneof=LOW MEDIUM HIGH CRITICAL"`
}

type UpdateTicketRequest struct {
	Title       string                `json:"title" validate:"omitempty,min=3,max=255"`
	Description string                `json:"description" validate:"omitempty,min=5"`
	Category    string                `json:"category" validate:"omitempty"`
	Priority    models.TicketPriority `json:"priority" validate:"omitempty,oneof=LOW MEDIUM HIGH CRITICAL"`
	Status      models.TicketStatus   `json:"status" validate:"omitempty,oneof=OPEN IN_PROGRESS RESOLVED CLOSED"`
}

type AssignTicketRequest struct {
	AssignedTo uuid.UUID `json:"assigned_to" validate:"required"`
}

type TicketFilterQuery struct {
	Page     int                   `query:"page"`
	Limit    int                   `query:"limit"`
	Search   string                `query:"search"`
	Status   models.TicketStatus   `query:"status"`
	Priority models.TicketPriority `query:"priority"`
	SortBy   string                `query:"sort_by"`
}

// Dashboard DTOs
type DashboardStatsResponse struct {
	TotalTickets int64            `json:"total_tickets"`
	Open         int64            `json:"open_tickets"`
	InProgress   int64            `json:"in_progress_tickets"`
	Resolved     int64            `json:"resolved_tickets"`
	Closed       int64            `json:"closed_tickets"`
	TotalUsers   int64            `json:"total_users"`
	RecentTicket []models.Ticket  `json:"recent_tickets,omitempty"`
	ByPriority   map[string]int64 `json:"tickets_by_priority"`
	GeneratedAt  time.Time        `json:"generated_at"`
}
