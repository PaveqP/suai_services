package handlers

import (
	"fmt"
	"net/http"
	user_models "taxi/internal/user/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) SignIn(c *gin.Context) {
	var userCredentials user_models.UserCredentials
	if err := c.BindJSON(&userCredentials); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	tokens, err := h.userServices.Auth.SignIn(userCredentials)
	if err != nil {
		logrus.Errorf("Can`t create user: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, tokens)
}

func (h *Handler) SignUp(c *gin.Context) {
	var userParams user_models.CreateUserParams
	if err := c.BindJSON(&userParams); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	err := h.userServices.Auth.SignUp(userParams)
	if err != nil {
		logrus.Errorf("Can`t create user %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"message": fmt.Sprintf("Hello, %s. You are signed up successfully!", userParams.Name),
	})
}
