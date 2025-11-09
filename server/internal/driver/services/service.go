package driver_services

import (
	driver_models "taxi/internal/driver/models"
	driver_repositories "taxi/internal/driver/repositories"
	"taxi/internal/jwt"
)

type Auth interface {
	SignIn(credentials driver_models.DriverCredentials) (*jwt.TokensPair, error)
}

type DriverService struct {
	Auth
}

func NewService(repo *driver_repositories.DriverRepository, jwt *jwt.JwtService) *DriverService {
	return &DriverService{
		Auth: NewAuthService(repo, jwt),
	}
}
