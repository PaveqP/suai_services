package stuff_models

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
