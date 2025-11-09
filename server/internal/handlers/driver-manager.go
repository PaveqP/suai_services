package handlers

import (
	"fmt"
	"net/http"
	driver_models "taxi/internal/driver/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) CreateDriver(c *gin.Context) {
	var driverParams driver_models.CreateDriverParams
	if err := c.BindJSON(&driverParams); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	err := h.stuffServices.DriverManager.CreateDriver(driverParams)
	if err != nil {
		logrus.Errorf("Can`t create driver %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"message": fmt.Sprintf("Driver %s %s was created successfully with email: %s", driverParams.Name, driverParams.Surname, driverParams.Email),
	})
}
