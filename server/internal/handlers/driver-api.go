package handlers

import (
	"net/http"
	driver_models "taxi/internal/driver/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) GetDriverInfo(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	driverInfo, err := h.driverServices.Manager.GetDriverInfo(driverId)
	if err != nil {
		logrus.Errorf("Failed to get driver info: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get driver info"})
		return
	}

	c.JSON(http.StatusOK, driverInfo)
}

func (h *Handler) UpdateDriverInfo(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	var req driver_models.UpdateDriverInfoRequest
	if err := c.BindJSON(&req); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = h.driverServices.Manager.UpdateDriverInfo(driverId, &req)
	if err != nil {
		logrus.Errorf("Failed to update driver info: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update driver info"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Driver info updated successfully"})
}

func (h *Handler) GetDriverOrders(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	orders, err := h.driverServices.Manager.GetDriverOrders(driverId)
	if err != nil {
		logrus.Errorf("Failed to get driver orders: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get driver orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func (h *Handler) AcceptOrder(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	orderId := c.Param("id")
	if orderId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	err = h.driverServices.Manager.AcceptOrder(orderId, driverId)
	if err != nil {
		logrus.Errorf("Failed to accept order: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order accepted successfully"})
}

func (h *Handler) StartTrip(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	orderId := c.Param("id")
	if orderId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	err = h.driverServices.Manager.StartTrip(orderId, driverId)
	if err != nil {
		logrus.Errorf("Failed to start trip: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Trip started successfully"})
}

func (h *Handler) CompleteOrder(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	orderId := c.Param("id")
	if orderId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	err = h.driverServices.Manager.CompleteOrder(orderId, driverId)
	if err != nil {
		logrus.Errorf("Failed to complete order: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order completed successfully"})
}

func (h *Handler) GetDriverCars(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	cars, err := h.driverServices.Manager.GetDriverCars(driverId)
	if err != nil {
		logrus.Errorf("Failed to get driver cars: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get driver cars"})
		return
	}

	c.JSON(http.StatusOK, cars)
}

func (h *Handler) AddCar(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	var car driver_models.CarInfo
	if err := c.BindJSON(&car); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = h.driverServices.Manager.AddCar(driverId, &car)
	if err != nil {
		logrus.Errorf("Failed to add car: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add car"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Car added successfully"})
}

func (h *Handler) AddPaymentInfo(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	var paymentInfo driver_models.PaymentInfoRequest
	if err := c.BindJSON(&paymentInfo); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = h.driverServices.Manager.AddPaymentInfo(driverId, &paymentInfo)
	if err != nil {
		logrus.Errorf("Failed to add payment info: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add payment info"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment info added successfully"})
}

func (h *Handler) GetShifts(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	shifts, err := h.driverServices.Manager.GetShifts(driverId)
	if err != nil {
		logrus.Errorf("Failed to get shifts: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get shifts"})
		return
	}

	c.JSON(http.StatusOK, shifts)
}

func (h *Handler) GetActiveShift(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	shift, err := h.driverServices.Manager.GetActiveShift(driverId)
	if err != nil {
		logrus.Errorf("Failed to get active shift: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active shift"})
		return
	}

	if shift == nil {
		c.JSON(http.StatusOK, nil)
		return
	}

	c.JSON(http.StatusOK, shift)
}

func (h *Handler) StartShift(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	response, err := h.driverServices.Manager.StartShift(driverId)
	if err != nil {
		logrus.Errorf("Failed to start shift: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) EndShift(c *gin.Context) {
	driverId, err := getDriverId(c)
	if err != nil {
		return
	}

	shift, err := h.driverServices.Manager.GetActiveShift(driverId)
	if err != nil {
		logrus.Errorf("Failed to get active shift: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active shift"})
		return
	}

	if shift == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No active shift found"})
		return
	}

	response, err := h.driverServices.Manager.EndShift(shift.Id, driverId)
	if err != nil {
		logrus.Errorf("Failed to end shift: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

