package stuff_models

import "database/sql"

type CreateStuffParams struct {
	Name        string `json:"name"`
	Surname     string `json:"surname"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	PhoneNumber string `json:"phone_number"`
}

type StuffCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ReturningStuffCredentials struct {
	Id       string `json:"id" db:"id"`
	Password string `json:"password" db:"hashed_password"`
}

type UpdateTicketRequest struct {
	Status   *string `json:"status" db:"status"`
	Solution *string `json:"solution" db:"solution"`
}

type TicketInfo struct {
	Status   string
	Solution sql.NullString
}
