package handlers

import (
	"net/http"
	stuff_models "taxi/internal/stuff/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) StuffSignIn(c *gin.Context) {
	var stuffCredentials stuff_models.StuffCredentials
	if err := c.BindJSON(&stuffCredentials); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	tokens, err := h.stuffServices.Auth.SignIn(stuffCredentials)
	if err != nil {
		logrus.Errorf("Can`t create user: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, tokens)
}
