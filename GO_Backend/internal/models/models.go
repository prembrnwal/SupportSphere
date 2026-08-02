package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User Roles
type UserRole string

const (
	RoleAdmin    UserRole = "ADMIN"
	RoleCustomer UserRole = "CUSTOMER"
)

// Ticket Status
type TicketStatus string

const (
	StatusOpen       TicketStatus = "OPEN"
	StatusInProgress TicketStatus = "IN_PROGRESS"
	StatusResolved   TicketStatus = "RESOLVED"
	StatusClosed     TicketStatus = "CLOSED"
)

// Ticket Priority
type TicketPriority string

const (
	PriorityLow      TicketPriority = "LOW"
	PriorityMedium   TicketPriority = "MEDIUM"
	PriorityHigh     TicketPriority = "HIGH"
	PriorityCritical TicketPriority = "CRITICAL"
)

// User Model
type User struct {
	ID                     uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name                   string     `gorm:"size:255;not null" json:"name"`
	Email                  string     `gorm:"size:255;not null;uniqueIndex" json:"email"`
	Password               string     `gorm:"size:255;not null" json:"-"`
	Role                   UserRole   `gorm:"type:varchar(20);not null;default:'CUSTOMER'" json:"role"`
	AvatarURL              string     `gorm:"size:500" json:"avatar_url,omitempty"`
	IsEmailVerified        bool       `gorm:"default:false" json:"is_email_verified"`
	PasswordResetToken     string     `gorm:"size:255" json:"-"`
	PasswordResetExpiresAt *time.Time `json:"-"`
	FailedLoginAttempts    int        `gorm:"default:0" json:"-"`
	LockedUntil            *time.Time `json:"-"`
	LastLoginAt            *time.Time `json:"last_login_at,omitempty"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`
}

// RefreshToken Model
type RefreshToken struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	TokenHash  string    `gorm:"size:255;not null;uniqueIndex" json:"-"`
	IPAddress  string    `gorm:"size:50" json:"ip_address"`
	UserAgent  string    `gorm:"size:500" json:"user_agent"`
	IsRevoked  bool      `gorm:"default:false" json:"is_revoked"`
	ExpiresAt  time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
}

// AuditLog Model
type AuditLog struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid;index" json:"user_id,omitempty"`
	Action    string    `gorm:"size:100;not null" json:"action"`
	IPAddress string    `gorm:"size:50" json:"ip_address"`
	UserAgent string    `gorm:"size:500" json:"user_agent"`
	Details   string    `gorm:"type:text" json:"details,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// Ticket Model
type Ticket struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Category    string         `gorm:"size:100;not null;default:'general'" json:"category"`
	Priority    TicketPriority `gorm:"type:varchar(20);not null;default:'MEDIUM'" json:"priority"`
	Status      TicketStatus   `gorm:"type:varchar(20);not null;default:'OPEN'" json:"status"`
	CreatedBy   uuid.UUID      `gorm:"type:uuid;not null;index" json:"created_by"`
	Creator     User           `gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"creator,omitempty"`
	AssignedTo  *uuid.UUID     `gorm:"type:uuid;index" json:"assigned_to"`
	Assignee    *User          `gorm:"foreignKey:AssignedTo;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"assignee,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// BeforeCreate GORM hooks
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

func (rt *RefreshToken) BeforeCreate(tx *gorm.DB) (err error) {
	if rt.ID == uuid.Nil {
		rt.ID = uuid.New()
	}
	return
}

func (al *AuditLog) BeforeCreate(tx *gorm.DB) (err error) {
	if al.ID == uuid.Nil {
		al.ID = uuid.New()
	}
	return
}

func (t *Ticket) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return
}
