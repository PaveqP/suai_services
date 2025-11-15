package stuff_services

import (
	"database/sql"
	"taxi/internal/shared"
	stuff_models "taxi/internal/stuff/models"
	stuff_repositories "taxi/internal/stuff/repositories"
)

type TicketService struct {
	r *stuff_repositories.StuffRepository
}

func NewTicketService(r *stuff_repositories.StuffRepository) *TicketService {
	return &TicketService{r}
}

func (ts *TicketService) CreateTicket(user_id string, user_role string, ticketData shared.CreateTicketRequest) error {
	fromDriver := (user_role == "driver")
	err := ts.r.CreateTicket(user_id, fromDriver, ticketData)

	return err
}

func (ts *TicketService) GetTickets() (*[]shared.TicketResponse, error) {
	tickets, err := ts.r.TicketManager.GetTickets()
	if err != nil {
		return nil, err
	}
	return tickets, nil
}

func (ts *TicketService) UpdateTicket(userID string, ticketID string, req *stuff_models.UpdateTicketRequest) error {
	updateData := ts.buildTicketUpdateModel(req)

	return ts.r.TicketManager.UpdateTicket(ticketID, userID, updateData)
}

func (ts *TicketService) buildTicketUpdateModel(req *stuff_models.UpdateTicketRequest) *stuff_models.TicketInfo {
	ticketInfo := &stuff_models.TicketInfo{}

	if req.Status != nil {
		ticketInfo.Status = *req.Status
	}

	if req.Solution != nil {
		ticketInfo.Solution = sql.NullString{
			String: *req.Solution,
			Valid:  true,
		}
	} else {
		ticketInfo.Solution = sql.NullString{Valid: false}
	}

	return ticketInfo
}
