package middleware

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"support-system-backend/internal/utils"
)

func GlobalErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	var e *fiber.Error
	if errors.As(err, &e) {
		code = e.Code
	}

	utils.Logger.Error("Unhandled request error",
		zap.String("path", c.Path()),
		zap.String("method", c.Method()),
		zap.Int("status", code),
		zap.Error(err),
	)

	return utils.SendError(c, code, "An unexpected error occurred", []string{err.Error()})
}

func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := c.Next()
		status := c.Response().StatusCode()
		utils.Logger.Info("API Request",
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", status),
			zap.String("ip", c.IP()),
		)
		return err
	}
}
