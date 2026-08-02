package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	"gorm.io/gorm"

	authHandler "support-system-backend/internal/auth/handler"
	authRepo "support-system-backend/internal/auth/repository"
	authService "support-system-backend/internal/auth/service"

	userHandler "support-system-backend/internal/user/handler"
	userRepo "support-system-backend/internal/user/repository"
	userService "support-system-backend/internal/user/service"

	ticketHandler "support-system-backend/internal/ticket/handler"
	ticketRepo "support-system-backend/internal/ticket/repository"
	ticketService "support-system-backend/internal/ticket/service"

	dashboardHandler "support-system-backend/internal/dashboard/handler"

	"support-system-backend/internal/config"
	"support-system-backend/internal/middleware"
	"support-system-backend/internal/models"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	// Repositories
	authRepository := authRepo.NewAuthRepository(db)
	userRepository := userRepo.NewUserRepository(db)
	ticketRepository := ticketRepo.NewTicketRepository(db)

	// Services
	authSvc := authService.NewAuthService(authRepository, cfg)
	userSvc := userService.NewUserService(userRepository)
	ticketSvc := ticketService.NewTicketService(ticketRepository, userRepository)

	// Handlers
	authH := authHandler.NewAuthHandler(authSvc)
	userH := userHandler.NewUserHandler(userSvc)
	ticketH := ticketHandler.NewTicketHandler(ticketSvc)
	dashH := dashboardHandler.NewDashboardHandler(db)

	// Swagger Endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	// API Group /api/v1
	api := app.Group("/api/v1")

	// Health Check Endpoint
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "healthy",
			"service": "Support Management System API",
		})
	})

	// Public Auth Routes (With Rate Limiter for Brute Force Protection)
	authGroup := api.Group("/auth", middleware.AuthRateLimiter())
	authGroup.Post("/register", authH.Register)
	authGroup.Post("/login", authH.Login)
	authGroup.Post("/refresh-token", authH.RefreshToken)
	authGroup.Post("/logout", authH.Logout)
	authGroup.Post("/forgot-password", authH.ForgotPassword)
	authGroup.Post("/reset-password", authH.ResetPassword)

	// Protected Routes (Require JWT Auth)
	protected := api.Group("", middleware.AuthMiddleware(cfg))

	// User Self Route
	protected.Get("/me", authH.GetMe)

	// Users Routes (Admin only)
	usersGroup := protected.Group("/users")
	usersGroup.Get("/", middleware.RequireRoles(models.RoleAdmin), userH.GetAllUsers)
	usersGroup.Get("/:id", userH.GetUserByID)
	usersGroup.Put("/:id", userH.UpdateUser)

	// Tickets Routes (Accessible by CUSTOMER for own, ADMIN for all)
	ticketsGroup := protected.Group("/tickets")
	ticketsGroup.Post("/", ticketH.CreateTicket)
	ticketsGroup.Get("/", ticketH.GetTickets)
	ticketsGroup.Get("/:id", ticketH.GetTicketByID)
	ticketsGroup.Put("/:id", ticketH.UpdateTicket)
	ticketsGroup.Delete("/:id", ticketH.DeleteTicket)

	// Admin Routes
	adminGroup := protected.Group("/admin", middleware.RequireRoles(models.RoleAdmin))
	adminGroup.Put("/assign-ticket/:id", ticketH.AssignTicket)

	// Dashboard Routes
	protected.Get("/dashboard/stats", dashH.GetDashboardStats)
}
