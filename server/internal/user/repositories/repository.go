package user_repositories

import (
	user_models "taxi/internal/user/models"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	SignUp(user user_models.CreateUserParams) error
	GetUserCredentials(email string) (*user_models.ReturningUserCredentials, error)
}

type UserRepository struct {
	Auth
}

func NewRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{
		Auth: NewAuthRepository(db),
	}
}
