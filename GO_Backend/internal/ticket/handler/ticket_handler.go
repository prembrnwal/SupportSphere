package handler

import (
	"github.com/gofiber/fiber/v2"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
	"support-system-backend/internal/ticket/service"
	"support-system-backend/internal/utils"
)

type TicketHandler struct {
	ticketService service.TicketService
}

func NewTicketHandler(ticketService service.TicketService) *TicketHandler {
	return &TicketHandler{ticketService: ticketService}
}

// CreateTicket godoc
// @Summary Create a new support ticket
// @Description Submit a new ticket (CUSTOMER or ADMIN)
// @Tags Tickets
// @Accept json
// @Produce json
// @Param request body dto.CreateTicketRequest true "Create Ticket Request"
// @Security BearerAuth
// @Success 201 {object} dto.ApiResponse{data=models.Ticket}
// @Failure 400 {object} dto.ApiResponse
// @Router /api/v1/tickets [post]
func (h *TicketHandler) CreateTicket(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req dto.CreateTicketRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	ticket, err := h.ticketService.CreateTicket(&req, userID)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusCreated, "Ticket created successfully", ticket)
}

// GetTickets godoc
// @Summary Get tickets list
// @Description Retrieve tickets with search, filtering, sorting, and pagination
// @Tags Tickets
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search in title/description"
// @Param status query string false "Filter by status: OPEN, IN_PROGRESS, RESOLVED, CLOSED"
// @Param priority query string false "Filter by priority: LOW, MEDIUM, HIGH, CRITICAL"
// @Param sort_by query string false "Sort order: desc (default) or asc"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=dto.PaginatedResponse}
// @Router /api/v1/tickets [get]
func (h *TicketHandler) GetTickets(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("role").(models.UserRole)

	var query dto.TicketFilterQuery
	if err := c.QueryParser(&query); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid query parameters", nil)
	}

	res, err := h.ticketService.GetTickets(query, userRole, userID)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to fetch tickets", []string{err.Error()})
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Tickets retrieved successfully", res)
}

// GetTicketByID godoc
// @Summary Get ticket details by ID
// @Description Get specific ticket details by UUID
// @Tags Tickets
// @Produce json
// @Param id path string true "Ticket ID"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=models.Ticket}
// @Failure 404 {object} dto.ApiResponse
// @Router /api/v1/tickets/{id} [get]
func (h *TicketHandler) GetTicketByID(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("role").(models.UserRole)
	id := c.Params("id")

	ticket, err := h.ticketService.GetTicketByID(id, userRole, userID)
	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Ticket retrieved successfully", ticket)
}

// UpdateTicket godoc
// @Summary Update ticket details or status
// @Description Update ticket parameters by ID
// @Tags Tickets
// @Accept json
// @Produce json
// @Param id path string true "Ticket ID"
// @Param request body dto.UpdateTicketRequest true "Update Ticket Payload"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=models.Ticket}
// @Failure 400 {object} dto.ApiResponse
// @Router /api/v1/tickets/{id} [put]
func (h *TicketHandler) UpdateTicket(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("role").(models.UserRole)
	id := c.Params("id")

	var req dto.UpdateTicketRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	ticket, err := h.ticketService.UpdateTicket(id, &req, userRole, userID)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Ticket updated successfully", ticket)
}

// AssignTicket godoc
// @Summary Assign ticket to a support agent (ADMIN only)
// @Description Assign a ticket to a support agent by ID
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path string true "Ticket ID"
// @Param request body dto.AssignTicketRequest true "Assign Ticket Payload"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=models.Ticket}
// @Failure 400 {object} dto.ApiResponse
// @Router /api/v1/admin/assign-ticket/{id} [put]
func (h *TicketHandler) AssignTicket(c *fiber.Ctx) error {
	id := c.Params("id")

	var req dto.AssignTicketRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	ticket, err := h.ticketService.AssignTicket(id, &req)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Ticket assigned successfully", ticket)
}

// DeleteTicket godoc
// @Summary Delete ticket by ID
// @Description Delete ticket by ID (Customer for own ticket or Admin)
// @Tags Tickets
// @Produce json
// @Param id path string true "Ticket ID"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse
// @Failure 400 {object} dto.ApiResponse
// @Router /api/v1/tickets/{id} [delete]
func (h *TicketHandler) DeleteTicket(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("role").(models.UserRole)
	id := c.Params("id")

	if err := h.ticketService.DeleteTicket(id, userRole, userID); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Ticket deleted successfully", nil)
}
