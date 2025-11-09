package jwt

import "time"

type JWTConfig struct {
	AccessTTL         time.Duration
	RefreshTTL        time.Duration
	AccessSigningKey  string
	RefreshSigningKey string
}

type TokensPair struct {
	AccessToken  string
	RefreshToken string
}

type TokenPayload struct {
	UserId   string `json:"user_id"`
	UserRole string `json:"user_role"`
}

type TokenHandling interface {
	GenerateTokensPair(userId string, userRole string) (*TokensPair, error)
	VerifyAccessToken(accessToken string) (*TokenPayload, error)
	VerifyRefreshToken(refreshToken string) (*TokenPayload, error)
	RefreshTokens(refreshToken string) (*TokensPair, error)
}

type JwtService struct {
	TokenHandling
}

func NewJwtService(config *JWTConfig) *JwtService {
	return &JwtService{
		TokenHandling: NewJwtHandling(config),
	}
}
