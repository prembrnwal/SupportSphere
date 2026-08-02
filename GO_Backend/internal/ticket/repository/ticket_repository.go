package repository

import (
	"gorm.io/gorm"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
)

type TicketRepository interface {
	Create(ticket *models.Ticket) error
	FindByID(id string) (*models.Ticket, error)
	FindAll(query dto.TicketFilterQuery, userRole models.UserRole, userID string) ([]models.Ticket, int64, error)
	Update(ticket *models.Ticket) error
	Delete(id string) error
}

type ticketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) TicketRepository {
	return &ticketRepository{db: db}
}

func (r *ticketRepository) Create(ticket *models.Ticket) error {
	return r.db.Create(ticket).Error
}

func (r *ticketRepository) FindByID(id string) (*models.Ticket, error) {
	var ticket models.Ticket
	err := r.db.
		Preload("Creator", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Preload("Assignee", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Where("id = ?", id).
		First(&ticket).Error
	if err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *ticketRepository) FindAll(query dto.TicketFilterQuery, userRole models.UserRole, userID string) ([]models.Ticket, int64, error) {
	var tickets []models.Ticket
	var total int64

	dbQuery := r.db.Model(&models.Ticket{})

	// Apply Role Authorization Filter
	if userRole == models.RoleCustomer {
		dbQuery = dbQuery.Where("created_by = ?", userID)
	}
	// ADMIN gets all tickets

	// Apply Search Filter
	if query.Search != "" {
		dbQuery = dbQuery.Where("LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)", "%"+query.Search+"%", "%"+query.Search+"%")
	}

	// Apply Status Filter
	if query.Status != "" {
		dbQuery = dbQuery.Where("status = ?", query.Status)
	}

	// Apply Priority Filter
	if query.Priority != "" {
		dbQuery = dbQuery.Where("priority = ?", query.Priority)
	}

	// Count Total Items
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply Pagination
	page := query.Page
	if page < 1 {
		page = 1
	}
	limit := query.Limit
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Apply Sorting
	sort := "created_at desc"
	if query.SortBy == "asc" || query.SortBy == "created_at_asc" {
		sort = "created_at asc"
	}

	err := dbQuery.
		Preload("Creator", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Preload("Assignee", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Order(sort).
		Limit(limit).
		Offset(offset).
		Find(&tickets).Error

	return tickets, total, err
}

func (r *ticketRepository) Update(ticket *models.Ticket) error {
	return r.db.Save(ticket).Error
}

func (r *ticketRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Ticket{}).Error
}
