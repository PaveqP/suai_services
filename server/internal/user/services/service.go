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

type UserService struct {
	Auth
}

func NewService(repo *user_repositories.UserRepository, jwt *jwt.JwtService) *UserService {
	return &UserService{
		Auth: NewAuthService(repo, jwt),
	}
}
