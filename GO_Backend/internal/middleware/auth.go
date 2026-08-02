package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"support-system-backend/internal/config"
	"support-system-backend/internal/models"
	"support-system-backend/internal/utils"
)

func AuthMiddleware(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.SendError(c, fiber.StatusUnauthorized, "Missing Authorization header", nil)
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return utils.SendError(c, fiber.StatusUnauthorized, "Invalid Authorization header format. Expected Bearer token", nil)
		}

		tokenString := parts[1]
		claims, err := utils.ValidateToken(tokenString, cfg.JWTSecret)
		if err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, "Invalid or expired JWT token", nil)
		}

		// Store user details in fiber context locals
		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

func RequireRoles(allowedRoles ...models.UserRole) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRoleRaw := c.Locals("role")
		if userRoleRaw == nil {
			return utils.SendError(c, fiber.StatusUnauthorized, "Unauthorized access", nil)
		}

		userRole := userRoleRaw.(models.UserRole)

		// ADMIN has universal access
		if userRole == models.RoleAdmin {
			return c.Next()
		}

		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return utils.SendError(c, fiber.StatusForbidden, "Access denied. Insufficient role permissions", nil)
	}
}
