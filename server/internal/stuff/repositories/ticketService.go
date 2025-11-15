package stuff_repositories

import (
	"errors"
	"fmt"
	"strings"
	"taxi/internal/shared"
	stuff_models "taxi/internal/stuff/models"

	"github.com/jmoiron/sqlx"
)

type TicketRepository struct {
	db *sqlx.DB
}

func NewTicketRepository(db *sqlx.DB) *TicketRepository {
	return &TicketRepository{db}
}

func (tr *TicketRepository) CreateTicket(user_id string, fromDriver bool, ticketData shared.CreateTicketRequest) error {
	query := `INSERT INTO ticket 
	(issue, details, order_id, claiment_driver, status, solution, created_at, updated_at) 
	VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`
	_, err := tr.db.Exec(query, ticketData.Issue, ticketData.Details, ticketData.OrderId, fromDriver, ticketData.Status, ticketData.Solution)
	if err != nil {
		return err
	}

	return nil
}

func (tr *TicketRepository) GetTickets() (*[]shared.TicketResponse, error) {
	query := `SELECT id, issue, details, order_id, claiment_driver, stuff_id, status, solution FROM ticket`
	var tickets []shared.TicketResponse
	err := tr.db.Select(&tickets, query)
	if err != nil {
		return nil, err
	}
	return &tickets, nil
}

func (tr *TicketRepository) UpdateTicket(ticketID string, userID string, ticketInfo *stuff_models.TicketInfo) error {
	query, args := tr.buildUpdateTicketQuery(ticketID, userID, ticketInfo)

	if query == "" {
		return errors.New("can not create query")
	}

	_, err := tr.db.Exec(query, args...)
	return err
}

func (tr *TicketRepository) buildUpdateTicketQuery(ticketID string, userID string, ticketInfo *stuff_models.TicketInfo) (string, []interface{}) {
	var setClauses []string
	var args []interface{}
	argIndex := 1

	setClauses = append(setClauses, fmt.Sprintf("stuff_id = $%d", argIndex))
	args = append(args, userID)
	argIndex++

	if ticketInfo.Status != "" {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, ticketInfo.Status)
		argIndex++
	}

	// if ticketInfo.Solution.Valid {
	// 	setClauses = append(setClauses, fmt.Sprintf("solution = $%d", argIndex))
	// 	args = append(args, ticketInfo.Solution.String)
	// 	argIndex++
	// } else {
	// 	setClauses = append(setClauses, `solution = ""`)
	// }

	if len(setClauses) == 0 {
		return "", nil
	}

	setClauses = append(setClauses, "updated_at = NOW()")
	query := fmt.Sprintf(`UPDATE ticket SET %s WHERE id = $%d`,
		strings.Join(setClauses, ", "), argIndex)
	args = append(args, ticketID)

	return query, args
}
