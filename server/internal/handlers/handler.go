package handlers

import (
	driver_services "taxi/internal/driver/services"
	"taxi/internal/jwt"
	stuff_services "taxi/internal/stuff/services"
	user_services "taxi/internal/user/services"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	userServices   *user_services.UserService
	driverServices *driver_services.DriverService
	stuffServices  *stuff_services.StuffService
	jwtService     *jwt.JwtService
}

func NewHandler(userServices *user_services.UserService, driverServices *driver_services.DriverService, stuffServices *stuff_services.StuffService, jwtService *jwt.JwtService) *Handler {
	return &Handler{userServices, driverServices, stuffServices, jwtService}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()

	user := router.Group("/user")
	{
		auth := user.Group("/auth")
		{
			auth.POST("/sign-in", h.SignIn)
			auth.POST("/sign-up", h.SignUp)
		}

		api := user.Group("/api", h.identifyUser)
		{
			api.GET("/", h.GetUserInfo)
			api.PATCH("/personal/update", h.UpdateUserInfo)
			api.GET("/orders", h.GetUserOrders)
			api.POST("/orders/create", h.CreateOrder)
			api.GET("/orders/price", h.GetOrderPrice)
			api.POST("/tickets/create", h.CreateTicket)
		}
	}

	driver := router.Group("/driver")
	{
		auth := driver.Group("/auth")
		{
			auth.POST("/sign-in", h.DriverSignIn)
		}

		api := driver.Group("/api", h.identifyDriver)
		{
			api.GET("/", h.GetDriverInfo)
			api.PATCH("/update", h.UpdateDriverInfo)
			api.GET("/orders", h.GetDriverOrders)
			api.POST("/orders/:id/accept", h.AcceptOrder)
			api.POST("/orders/:id/start", h.StartTrip)
			api.POST("/orders/:id/complete", h.CompleteOrder)
			api.GET("/cars", h.GetDriverCars)
			api.POST("/cars", h.AddCar)
			api.POST("/payment-info", h.AddPaymentInfo)
			api.GET("/shifts", h.GetShifts)
			api.GET("/shifts/active", h.GetActiveShift)
			api.POST("/shifts/start", h.StartShift)
			api.POST("/shifts/end", h.EndShift)
			api.POST("/tickets/create", h.CreateTicket)
		}
	}

	stuff := router.Group("/stuff")
	{
		auth := stuff.Group("/auth")
		{
			auth.POST("/sign-in", h.StuffSignIn)
		}
		manager := stuff.Group("/manager", h.identifyStuff)
		{
			manager.GET("/tickets", h.GetTickets)
			manager.PATCH("/tickets/:id", h.UpdateTicket)
			driver := manager.Group("/driver")
			{
				driver.POST("/create", h.CreateDriver)
			}
		}
	}

	return router
}
