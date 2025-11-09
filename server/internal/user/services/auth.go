package user_services

import (
	"errors"
	"taxi/internal/jwt"
	user_models "taxi/internal/user/models"
	user_repositories "taxi/internal/user/repositories"

	"golang.org/x/crypto/bcrypt"
)

const UserRole = "user"

type AuthService struct {
	r          *user_repositories.UserRepository
	jwtService *jwt.JwtService
}

func NewAuthService(repository *user_repositories.UserRepository, jwt *jwt.JwtService) *AuthService {
	return &AuthService{r: repository, jwtService: jwt}
}

func (as *AuthService) SignUp(user user_models.CreateUserParams) error {
	hashedPassword, err := as.hashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword
	return as.r.Auth.SignUp(user)
}

func (as *AuthService) SignIn(credentials user_models.UserCredentials) (*jwt.TokensPair, error) {
	usersCredentials, err := as.r.Auth.GetUserCredentials(credentials.Email)
	if err != nil {
		return nil, err
	}
	passwordVerified := as.verifyPassword(credentials.Password, usersCredentials.Password)
	if !passwordVerified {
		return nil, errors.New("incorrect password")
	}
	tokens, err := as.jwtService.GenerateTokensPair(usersCredentials.Id, UserRole)
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func (as *AuthService) hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func (as *AuthService) verifyPassword(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
