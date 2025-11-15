package shared

import "database/sql"

type CreateTicketRequest struct {
	Issue    string `json:"issue"`
	Details  string `json:"details"`
	OrderId  string `json:"order_id"`
	Status   string `json:"status"`
	Solution string `json:"solution"`
}

type TicketResponse struct {
	Id             string         `json:"id" db:"id"`
	Issue          string         `json:"issue" db:"issue"`
	Details        string         `json:"details" db:"details"`
	OrderId        string         `json:"order_id" db:"order_id"`
	ClaimantDriver bool           `json:"claiment_driver" db:"claiment_driver"`
	StuffId        sql.NullString `json:"stuff_id" db:"stuff_id"`
	Status         string         `json:"status" db:"status"`
	Solution       string         `json:"solution" db:"solution"`
}
