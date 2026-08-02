package service

import (
	"errors"
	"fmt"
	"math"

	"github.com/google/uuid"
	"support-system-backend/internal/dto"
	"support-system-backend/internal/models"
	"support-system-backend/internal/ticket/repository"
	userRepo "support-system-backend/internal/user/repository"
)

type TicketService interface {
	CreateTicket(req *dto.CreateTicketRequest, creatorID string) (*models.Ticket, error)
	GetTickets(query dto.TicketFilterQuery, userRole models.UserRole, userID string) (*dto.PaginatedResponse, error)
	GetTicketByID(id string, userRole models.UserRole, userID string) (*models.Ticket, error)
	UpdateTicket(id string, req *dto.UpdateTicketRequest, userRole models.UserRole, userID string) (*models.Ticket, error)
	AssignTicket(id string, req *dto.AssignTicketRequest) (*models.Ticket, error)
	DeleteTicket(id string, userRole models.UserRole, userID string) error
}

type ticketService struct {
	repo     repository.TicketRepository
	userRepo userRepo.UserRepository
}

func NewTicketService(repo repository.TicketRepository, userRepo userRepo.UserRepository) TicketService {
	return &ticketService{
		repo:     repo,
		userRepo: userRepo,
	}
}

func (s *ticketService) CreateTicket(req *dto.CreateTicketRequest, creatorID string) (*models.Ticket, error) {
	parsedCreatorID, err := uuid.Parse(creatorID)
	if err != nil {
		return nil, errors.New("invalid creator user ID")
	}

	priority := req.Priority
	if priority == "" {
		priority = models.PriorityMedium
	}

	category := req.Category
	if category == "" {
		category = "general"
	}

	ticket := &models.Ticket{
		Title:       req.Title,
		Description: req.Description,
		Category:    category,
		Priority:    priority,
		Status:      models.StatusOpen,
		CreatedBy:   parsedCreatorID,
	}

	if err := s.repo.Create(ticket); err != nil {
		return nil, fmt.Errorf("failed to create ticket: %w", err)
	}

	return s.repo.FindByID(ticket.ID.String())
}

func (s *ticketService) GetTickets(query dto.TicketFilterQuery, userRole models.UserRole, userID string) (*dto.PaginatedResponse, error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Limit < 1 || query.Limit > 100 {
		query.Limit = 10
	}

	tickets, total, err := s.repo.FindAll(query, userRole, userID)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(query.Limit)))

	return &dto.PaginatedResponse{
		Items: tickets,
		Pagination: dto.PaginationMeta{
			Page:       query.Page,
			Limit:      query.Limit,
			TotalItems: total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ticketService) GetTicketByID(id string, userRole models.UserRole, userID string) (*models.Ticket, error) {
	ticket, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("ticket not found")
	}

	// Customer can only view their own tickets; Admin has full access
	if userRole == models.RoleCustomer && ticket.CreatedBy.String() != userID {
		return nil, errors.New("access denied. You can only view your own tickets")
	}

	return ticket, nil
}

func (s *ticketService) UpdateTicket(id string, req *dto.UpdateTicketRequest, userRole models.UserRole, userID string) (*models.Ticket, error) {
	ticket, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("ticket not found")
	}

	// Permission check: Customer can only edit their own tickets; Admin can edit/manipulate any ticket
	if userRole == models.RoleCustomer && ticket.CreatedBy.String() != userID {
		return nil, errors.New("access denied. You can only update your own tickets")
	}

	if req.Title != "" {
		ticket.Title = req.Title
	}
	if req.Description != "" {
		ticket.Description = req.Description
	}
	if req.Category != "" {
		ticket.Category = req.Category
	}
	if req.Priority != "" {
		ticket.Priority = req.Priority
	}
	if req.Status != "" {
		ticket.Status = req.Status
	}

	if err := s.repo.Update(ticket); err != nil {
		return nil, fmt.Errorf("failed to update ticket: %w", err)
	}

	return s.repo.FindByID(ticket.ID.String())
}

func (s *ticketService) AssignTicket(id string, req *dto.AssignTicketRequest) (*models.Ticket, error) {
	ticket, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("ticket not found")
	}

	ticket.AssignedTo = &req.AssignedTo
	if ticket.Status == models.StatusOpen {
		ticket.Status = models.StatusInProgress
	}

	if err := s.repo.Update(ticket); err != nil {
		return nil, fmt.Errorf("failed to assign ticket: %w", err)
	}

	return s.repo.FindByID(ticket.ID.String())
}

func (s *ticketService) DeleteTicket(id string, userRole models.UserRole, userID string) error {
	ticket, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("ticket not found")
	}

	if userRole == models.RoleCustomer && ticket.CreatedBy.String() != userID {
		return errors.New("access denied. You can only delete your own tickets")
	}

	return s.repo.Delete(id)
}
