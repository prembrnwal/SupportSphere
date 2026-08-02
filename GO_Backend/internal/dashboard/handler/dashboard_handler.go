package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
	"support-system-backend/internal/utils"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

// GetDashboardStats godoc
// @Summary Get dashboard statistics
// @Description Retrieve count of tickets by status, priority, and total users
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=dto.DashboardStatsResponse}
// @Router /api/v1/dashboard/stats [get]
func (h *DashboardHandler) GetDashboardStats(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("role").(models.UserRole)

	ticketQuery := h.db.Model(&models.Ticket{})
	if userRole == models.RoleCustomer {
		ticketQuery = ticketQuery.Where("created_by = ?", userID)
	}

	var totalTickets, openCount, inProgressCount, resolvedCount, closedCount int64

	ticketQuery.Count(&totalTickets)
	h.db.Model(&models.Ticket{}).Scopes(roleScope(userRole, userID)).Where("status = ?", models.StatusOpen).Count(&openCount)
	h.db.Model(&models.Ticket{}).Scopes(roleScope(userRole, userID)).Where("status = ?", models.StatusInProgress).Count(&inProgressCount)
	h.db.Model(&models.Ticket{}).Scopes(roleScope(userRole, userID)).Where("status = ?", models.StatusResolved).Count(&resolvedCount)
	h.db.Model(&models.Ticket{}).Scopes(roleScope(userRole, userID)).Where("status = ?", models.StatusClosed).Count(&closedCount)

	var totalUsers int64
	if userRole == models.RoleAdmin {
		h.db.Model(&models.User{}).Count(&totalUsers)
	}

	// Priority distribution
	byPriority := make(map[string]int64)
	priorities := []models.TicketPriority{models.PriorityLow, models.PriorityMedium, models.PriorityHigh, models.PriorityCritical}
	for _, p := range priorities {
		var count int64
		h.db.Model(&models.Ticket{}).Scopes(roleScope(userRole, userID)).Where("priority = ?", p).Count(&count)
		byPriority[string(p)] = count
	}

	// Fetch recent 5 tickets
	var recentTickets []models.Ticket
	h.db.Model(&models.Ticket{}).
		Scopes(roleScope(userRole, userID)).
		Preload("Creator", func(db *gorm.DB) *gorm.DB { return db.Select("id, name, email") }).
		Order("created_at desc").
		Limit(5).
		Find(&recentTickets)

	stats := dto.DashboardStatsResponse{
		TotalTickets: totalTickets,
		Open:         openCount,
		InProgress:   inProgressCount,
		Resolved:     resolvedCount,
		Closed:       closedCount,
		TotalUsers:   totalUsers,
		RecentTicket: recentTickets,
		ByPriority:   byPriority,
		GeneratedAt:  time.Now(),
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Dashboard statistics retrieved successfully", stats)
}

func roleScope(userRole models.UserRole, userID string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if userRole == models.RoleCustomer {
			return db.Where("created_by = ?", userID)
		}
		return db
	}
}
