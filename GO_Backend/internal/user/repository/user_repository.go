package repository

import (
	"gorm.io/gorm"
	"support-system-backend/internal/models"
)

type UserRepository interface {
	FindAll() ([]models.User, error)
	FindByID(id string) (*models.User, error)
	Update(user *models.User) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Order("created_at desc").Find(&users).Error
	return users, err
}

func (r *userRepository) FindByID(id string) (*models.User, error) {
	var user models.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}
