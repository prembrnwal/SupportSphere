package service

import (
	"errors"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
	"support-system-backend/internal/user/repository"
)

type UserService interface {
	GetAllUsers() ([]models.User, error)
	GetUserByID(id string) (*models.User, error)
	UpdateUser(id string, req *dto.UpdateUserRequest) (*models.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetAllUsers() ([]models.User, error) {
	return s.repo.FindAll()
}

func (s *userService) GetUserByID(id string) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *userService) UpdateUser(id string, req *dto.UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}
