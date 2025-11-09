package handlers

import (
	"net/http"
	driver_models "taxi/internal/driver/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) DriverSignIn(c *gin.Context) {
	var driverCredentials driver_models.DriverCredentials
	if err := c.BindJSON(&driverCredentials); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	tokens, err := h.driverServices.Auth.SignIn(driverCredentials)
	if err != nil {
		logrus.Errorf("Can`t create user: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, tokens)
}
