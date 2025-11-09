package driver_repositories

import (
	driver_models "taxi/internal/driver/models"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	CreateDriver(driver driver_models.CreateDriverParams) error
	GetDriverCredentials(email string) (*driver_models.ReturningDriverCredentials, error)
}

type DriverRepository struct {
	Auth
}

func NewRepository(db *sqlx.DB) *DriverRepository {
	return &DriverRepository{
		Auth: NewAuthRepository(db),
	}
}
