package stuff_services

import (
	driver_models "taxi/internal/driver/models"
	driver_repositories "taxi/internal/driver/repositories"
	"taxi/internal/jwt"
	stuff_models "taxi/internal/stuff/models"
	stuff_repositories "taxi/internal/stuff/repositories"
	user_repositories "taxi/internal/user/repositories"
)

type Auth interface {
	SignIn(credentials stuff_models.StuffCredentials) (*jwt.TokensPair, error)
}

type DriverManager interface {
	CreateDriver(credentials driver_models.CreateDriverParams) error
	BlockDriver(driverId string, reason string) error
}

type UserManager interface {
	BlockUser(userId string, reason string) error
}

type StuffService struct {
	Auth
	DriverManager
	UserManager
}

func NewService(repo *stuff_repositories.StuffRepository, userRepo *user_repositories.UserRepository, driverRepo *driver_repositories.DriverRepository, jwt *jwt.JwtService) *StuffService {
	return &StuffService{
		Auth:          NewAuthService(repo, jwt),
		DriverManager: NewDriverManagerService(repo, driverRepo),
	}
}
