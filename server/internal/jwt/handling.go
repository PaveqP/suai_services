package jwt

import (
	"errors"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type tokenClaims struct {
	jwt.StandardClaims
	UserId   string `json:"user_id"`
	UserRole string `json:"user_role"`
}

type JwtHandling struct {
	config *JWTConfig
}

func NewJwtHandling(config *JWTConfig) *JwtHandling {
	return &JwtHandling{config}
}

func (jh JwtHandling) GenerateTokensPair(userId string, userRole string) (*TokensPair, error) {
	accessToken, err := jh.generateAccessToken(userId, userRole)
	if err != nil {
		return nil, err
	}

	refreshToken, err := jh.generateRefreshToken(userId, userRole)
	if err != nil {
		return nil, err
	}

	return &TokensPair{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

func (jh JwtHandling) VerifyAccessToken(accessToken string) (*TokenPayload, error) {
	return jh.verifyToken(accessToken, jh.config.AccessSigningKey)
}

func (jh JwtHandling) VerifyRefreshToken(refreshToken string) (*TokenPayload, error) {
	return jh.verifyToken(refreshToken, jh.config.RefreshSigningKey)
}

func (jh JwtHandling) RefreshTokens(refreshToken string) (*TokensPair, error) {
	payload, err := jh.VerifyRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}
	return jh.GenerateTokensPair(payload.UserId, payload.UserRole)
}

func (jh JwtHandling) generateAccessToken(userId string, userRole string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(jh.config.AccessTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		userId,
		userRole,
	})

	return token.SignedString([]byte(jh.config.AccessSigningKey))
}

func (jh JwtHandling) generateRefreshToken(userId string, userRole string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(jh.config.RefreshTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		userId,
		userRole,
	})

	return token.SignedString([]byte(jh.config.RefreshSigningKey))
}

func (jh JwtHandling) verifyToken(token string, signingKey string) (*TokenPayload, error) {
	parsedToken, err := jwt.ParseWithClaims(token, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(signingKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := parsedToken.Claims.(*tokenClaims); ok && parsedToken.Valid {
		return &TokenPayload{claims.UserId, claims.UserRole}, nil
	}

	return nil, errors.New("invalid token")
}
