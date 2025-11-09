package stuff_services

import (
	"errors"
	"taxi/internal/jwt"
	stuff_models "taxi/internal/stuff/models"
	stuff_repositories "taxi/internal/stuff/repositories"

	"golang.org/x/crypto/bcrypt"
)

const UserRole = "stuff"

type AuthService struct {
	r          *stuff_repositories.StuffRepository
	jwtService *jwt.JwtService
}

func NewAuthService(repository *stuff_repositories.StuffRepository, jwt *jwt.JwtService) *AuthService {
	return &AuthService{r: repository, jwtService: jwt}
}

func (as *AuthService) SignIn(credentials stuff_models.StuffCredentials) (*jwt.TokensPair, error) {
	stuffsCredentials, err := as.r.Auth.GetStuffCredentials(credentials.Email)
	if err != nil {
		return nil, err
	}
	passwordVerified := as.verifyPassword(credentials.Password, stuffsCredentials.Password)
	if !passwordVerified {
		return nil, errors.New("incorrect password")
	}
	tokens, err := as.jwtService.GenerateTokensPair(stuffsCredentials.Id, UserRole)
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func (as *AuthService) verifyPassword(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
