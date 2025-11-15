package user_services

import (
	"taxi/internal/jwt"
	user_models "taxi/internal/user/models"
	user_repositories "taxi/internal/user/repositories"
)

type Auth interface {
	SignUp(user user_models.CreateUserParams) error
	SignIn(credentials user_models.UserCredentials) (*jwt.TokensPair, error)
}

type Manager interface {
	GetUserInfo(userId string) (*user_models.UserInfoResponse, error)
	UpdateUserInfo(userID string, req *user_models.UpdateUserInfoRequest) error
	GetUserOrders(userID string) (*[]user_models.OrderResponse, error)
	CreateOrder(userId string, req *user_models.CreateOrderRequest) (string, error)
	GetOrderPrice(filters user_models.GetOrderPriceRequest) (string, error)
}

type UserService struct {
	Auth
	Manager
}

func NewService(repo *user_repositories.UserRepository, jwt *jwt.JwtService) *UserService {
	return &UserService{
		Auth:    NewAuthService(repo, jwt),
		Manager: NewManagerService(repo),
	}
}
