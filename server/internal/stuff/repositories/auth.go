package stuff_repositories

import (
	stuff_models "taxi/internal/stuff/models"

	"github.com/jmoiron/sqlx"
)

type AuthRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) *AuthRepository {
	return &AuthRepository{db}
}

func (ar *AuthRepository) GetStuffCredentials(email string) (*stuff_models.ReturningStuffCredentials, error) {
	query := `SELECT id, hashed_password from stuff WHERE post = $1`
	var stuffCredentials stuff_models.ReturningStuffCredentials
	if err := ar.db.Get(&stuffCredentials, query, email); err != nil {
		return nil, err
	}

	return &stuffCredentials, nil
}
