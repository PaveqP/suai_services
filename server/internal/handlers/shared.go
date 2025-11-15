package handlers

import (
	"net/http"
	"taxi/internal/shared"
	stuff_models "taxi/internal/stuff/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) CreateTicket(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	user_role, err := getUserRole(c)
	if err != nil {
		return
	}

	var ticketData shared.CreateTicketRequest
	if err := c.BindJSON(&ticketData); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = h.stuffServices.TicketManager.CreateTicket(user_id, user_role, ticketData)
	if err != nil {
		logrus.Errorf("Failed to create ticket: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

func (h *Handler) GetTickets(c *gin.Context) {
	user_role, err := getUserRole(c)
	if err != nil {
		return
	}

	if user_role != "stuff" {
		logrus.Errorf("Access Denied: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Access denied. Allow only for service stuff"})
		return
	}

	tickets, err := h.stuffServices.TicketManager.GetTickets()
	if err != nil {
		logrus.Errorf("Failed to fetch tickets: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

func (h *Handler) UpdateTicket(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	ticket_id := c.Param("id")

	var req stuff_models.UpdateTicketRequest
	if err := c.BindJSON(&req); err != nil {
		logrus.Errorf("Invalid request body: %s", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = h.stuffServices.TicketManager.UpdateTicket(user_id, ticket_id, &req)

	if err != nil {
		logrus.Errorf("Failed to update ticket: %s", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "OK",
	})
}
