package stuff_repositories

import (
	stuff_models "taxi/internal/stuff/models"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	GetStuffCredentials(email string) (*stuff_models.ReturningStuffCredentials, error)
}

type StuffRepository struct {
	Auth
}

func NewRepository(db *sqlx.DB) *StuffRepository {
	return &StuffRepository{
		Auth: NewAuthRepository(db),
	}
}
