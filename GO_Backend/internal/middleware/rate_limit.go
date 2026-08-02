package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"support-system-backend/internal/utils"
)

// AuthRateLimiter limits login/register attempts to 10 requests per minute per IP
func AuthRateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        10,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return utils.SendError(c, fiber.StatusTooManyRequests, "Too many login/registration attempts. Please try again in a minute.", nil)
		},
	})
}
