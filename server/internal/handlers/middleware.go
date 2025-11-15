package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const (
	authorizationHeader = "Authorization"
	correctHeaderLength = 2
	userIdKey           = "userId"
	userRole            = "role"
)

func (h *Handler) identifyUser(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)

	if header == "" {
		logrus.Error("empty auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "empty auth header")
		return
	}

	headerParts := strings.Split(header, " ")
	if len(headerParts) != correctHeaderLength {
		logrus.Error("invalid auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "invalid auth header")
		return
	}

	userParams, err := h.jwtService.VerifyAccessToken(headerParts[1])
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, err)
		return
	}

	c.Set(userIdKey, userParams.UserId)
	c.Set(userRole, userParams.UserRole)
}

func getUserId(c *gin.Context) (string, error) {
	userId, ok := c.Get(userIdKey)

	if !ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, "user id not found")
		return "", errors.New("user id not found")
	}

	return userId.(string), nil
}

func getUserRole(c *gin.Context) (string, error) {
	userRole, ok := c.Get(userRole)

	if !ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, "user role not found")
		return "", errors.New("user role not found")
	}

	return userRole.(string), nil
}

func (h *Handler) identifyDriver(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)

	if header == "" {
		logrus.Error("empty auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "empty auth header")
		return
	}

	headerParts := strings.Split(header, " ")
	if len(headerParts) != correctHeaderLength {
		logrus.Error("invalid auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "invalid auth header")
		return
	}

	userParams, err := h.jwtService.VerifyAccessToken(headerParts[1])
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, err)
		return
	}

	if userParams.UserRole != "driver" {
		logrus.Error("invalid user role")
		c.AbortWithStatusJSON(http.StatusForbidden, "access denied")
		return
	}

	c.Set(userIdKey, userParams.UserId)
	c.Set(userRole, userParams.UserRole)
}

func (h *Handler) identifyStuff(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)

	if header == "" {
		logrus.Error("empty auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "empty auth header")
		return
	}

	headerParts := strings.Split(header, " ")
	if len(headerParts) != correctHeaderLength {
		logrus.Error("invalid auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "invalid auth header")
		return
	}

	userParams, err := h.jwtService.VerifyAccessToken(headerParts[1])
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, err)
		return
	}

	if userParams.UserRole != "stuff" {
		logrus.Error("invalid user role")
		c.AbortWithStatusJSON(http.StatusForbidden, "access denied")
		return
	}

	c.Set(userIdKey, userParams.UserId)
	c.Set(userRole, userParams.UserRole)
}

func getDriverId(c *gin.Context) (string, error) {
	driverId, ok := c.Get(userIdKey)

	if !ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, "driver id not found")
		return "", errors.New("driver id not found")
	}

	return driverId.(string), nil
}
