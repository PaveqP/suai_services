package handlers

import (
	"net/http"
	user_models "taxi/internal/user/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) GetUserInfo(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	userInfo, err := h.userServices.GetUserInfo(user_id)
	if err != nil {
		logrus.Errorf("Can`t get user data %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, userInfo)
}

func (h *Handler) UpdateUserInfo(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	var req user_models.UpdateUserInfoRequest
	if err := c.BindJSON(&req); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = h.userServices.Manager.UpdateUserInfo(user_id, &req)
	if err != nil {
		logrus.Errorf("Failed to update user info: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user info"})
		return
	}

	c.JSON(http.StatusOK, user_models.UpdateUserInfoResponse{
		Success: true,
		Message: "User info updated successfully",
	})
}

func (h *Handler) GetOrderPrice(c *gin.Context) {
	filters := user_models.GetOrderPriceRequest{
		StartTripStreet:   c.Query("start_trip_street"),
		StartTripHouse:    c.Query("start_trip_house"),
		StartTripBuild:    c.Query("start_trip_build"),
		DestinationStreet: c.Query("destination_street"),
		DestinationHouse:  c.Query("destination_house"),
		DestinationBuild:  c.Query("destination_build"),
		ServiceCategory:   c.Query("service_category"),
	}

	if filters.StartTripStreet == "" || filters.StartTripHouse == "" || filters.DestinationStreet == "" || filters.DestinationHouse == "" || filters.ServiceCategory == "" {
		logrus.Error("Invalid request filters")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filters"})
		return
	}

	price, err := h.userServices.Manager.GetOrderPrice(filters)
	if err != nil {
		logrus.Errorf("Failed to update user info: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user info"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"price": price,
	})
}

func (h *Handler) GetUserOrders(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	orders, err := h.userServices.Manager.GetUserOrders(user_id)
	if err != nil {
		logrus.Errorf("Failed get orders: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed get orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func (h *Handler) CreateOrder(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	var req user_models.CreateOrderRequest
	if err := c.BindJSON(&req); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	orderId, err := h.userServices.Manager.CreateOrder(user_id, &req)
	if err != nil {
		logrus.Errorf("Failed to create order: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"orderId": orderId,
		"message": "Order created successfully",
	})
}
