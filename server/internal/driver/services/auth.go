package driver_services

import (
	"errors"
	driver_models "taxi/internal/driver/models"
	driver_repositories "taxi/internal/driver/repositories"
	"taxi/internal/jwt"

	"golang.org/x/crypto/bcrypt"
)

const UserRole = "driver"

type AuthService struct {
	r          *driver_repositories.DriverRepository
	jwtService *jwt.JwtService
}

func NewAuthService(repository *driver_repositories.DriverRepository, jwt *jwt.JwtService) *AuthService {
	return &AuthService{r: repository, jwtService: jwt}
}

func (as *AuthService) SignIn(credentials driver_models.DriverCredentials) (*jwt.TokensPair, error) {
	driversCredentials, err := as.r.Auth.GetDriverCredentials(credentials.Email)
	if err != nil {
		return nil, err
	}
	passwordVerified := as.verifyPassword(credentials.Password, driversCredentials.Password)
	if !passwordVerified {
		return nil, errors.New("incorrect password")
	}
	tokens, err := as.jwtService.GenerateTokensPair(driversCredentials.Id, UserRole)
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func (as *AuthService) verifyPassword(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
