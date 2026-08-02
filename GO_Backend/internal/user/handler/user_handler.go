package handler

import (
	"github.com/gofiber/fiber/v2"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/user/service"
	"support-system-backend/internal/utils"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetAllUsers godoc
// @Summary List all users
// @Description Retrieve a list of all registered users (Admin/Support only)
// @Tags Users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=[]models.User}
// @Failure 401 {object} dto.ApiResponse
// @Failure 403 {object} dto.ApiResponse
// @Router /api/v1/users [get]
func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to retrieve users", nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "Users retrieved successfully", users)
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get specific user by ID
// @Tags Users
// @Produce json
// @Param id path string true "User ID"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=models.User}
// @Failure 404 {object} dto.ApiResponse
// @Router /api/v1/users/{id} [get]
func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	id := c.Params("id")
	user, err := h.userService.GetUserByID(id)
	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "User details retrieved", user)
}

// UpdateUser godoc
// @Summary Update user by ID
// @Description Update user details (Name, Role, Avatar)
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body dto.UpdateUserRequest true "Update User Request"
// @Security BearerAuth
// @Success 200 {object} dto.ApiResponse{data=models.User}
// @Failure 400 {object} dto.ApiResponse
// @Failure 404 {object} dto.ApiResponse
// @Router /api/v1/users/{id} [put]
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var req dto.UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request payload format", nil)
	}

	if errs := utils.ValidateStruct(&req); len(errs) > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Validation error", errs)
	}

	user, err := h.userService.UpdateUser(id, &req)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SendSuccess(c, fiber.StatusOK, "User updated successfully", user)
}
