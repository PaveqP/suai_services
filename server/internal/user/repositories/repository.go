package user_repositories

import (
	user_models "taxi/internal/user/models"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	SignUp(user user_models.CreateUserParams) error
	GetUserCredentials(email string) (*user_models.ReturningUserCredentials, error)
}

type Manager interface {
	GetUserInfo(userId string) (*user_models.UserInfo, error)
	UpdateUserInfo(userID string, userInfo *user_models.UserInfo) error
	GetUserOrders(userID string) (*[]user_models.OrderResponse, error)
	CreateOrder(userId string, order *user_models.CreateOrderRequest) (string, error)
}

type UserRepository struct {
	Auth
	Manager
}

func NewRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{
		Auth:    NewAuthRepository(db),
		Manager: NewManagerRepository(db),
	}
}
