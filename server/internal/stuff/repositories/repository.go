package stuff_repositories

import (
	"taxi/internal/shared"
	stuff_models "taxi/internal/stuff/models"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	GetStuffCredentials(email string) (*stuff_models.ReturningStuffCredentials, error)
}

type TicketManager interface {
	CreateTicket(user_id string, fromDriver bool, ticketData shared.CreateTicketRequest) error
	GetTickets() (*[]shared.TicketResponse, error)
	UpdateTicket(user_id string, ticket_id string, req *stuff_models.TicketInfo) error
}

type StuffRepository struct {
	Auth
	TicketManager
}

func NewRepository(db *sqlx.DB) *StuffRepository {
	return &StuffRepository{
		Auth:          NewAuthRepository(db),
		TicketManager: NewTicketRepository(db),
	}
}
