package user_repositories

import (
	user_models "taxi/internal/user/models"
	"time"

	"github.com/jmoiron/sqlx"
)

type AuthRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) *AuthRepository {
	return &AuthRepository{db}
}

func (ar *AuthRepository) SignUp(user user_models.CreateUserParams) error {
	isActive := false
	createdAt := time.Now().Truncate(time.Microsecond)
	updatedAt := time.Now().Truncate(time.Microsecond)
	query := `INSERT INTO "user" (name, surname, email, hashed_password, phone_number, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	var userId string
	row := ar.db.QueryRow(query, user.Name, user.Surname, user.Email, user.Password, user.PhoneNumber, isActive, createdAt, updatedAt)
	if err := row.Scan(&userId); err != nil {
		return err
	}
	return nil
}

func (ar *AuthRepository) GetUserCredentials(email string) (*user_models.ReturningUserCredentials, error) {
	query := `SELECT id, hashed_password from "user" WHERE email = $1`
	var userCredentials user_models.ReturningUserCredentials
	if err := ar.db.Get(&userCredentials, query, email); err != nil {
		return nil, err
	}

	return &userCredentials, nil
}
