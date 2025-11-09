package handlers

import (
	driver_services "taxi/internal/driver/services"
	stuff_services "taxi/internal/stuff/services"
	user_services "taxi/internal/user/services"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	userServices   *user_services.UserService
	driverServices *driver_services.DriverService
	stuffServices  *stuff_services.StuffService
}

func NewHandler(userServices *user_services.UserService, driverServices *driver_services.DriverService, stuffServices *stuff_services.StuffService) *Handler {
	return &Handler{userServices, driverServices, stuffServices}
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

		// orders := user.Group("orders")
		// {
		// 	orders.GET("/")
		// 	orders.GET("/id")
		// 	orders.POST("/create")
		// }
	}

	driver := router.Group("/driver")
	{
		auth := driver.Group("/auth")
		{
			auth.POST("/sign-in", h.DriverSignIn)
		}
		// car := driver.Group("/car")
		// {
		// 	car.POST("/add", h.AttachCar)
		// }
		// orders := driver.Group("orders")
		// {
		// 	orders.GET("/")
		// 	orders.GET("/id")
		// 	orders.POST("/:id/take")
		// 	orders.POST("/:id/start")
		// 	orders.POST("/:id/complete")
		// 	orders.POST("/:id/reject")
		// }
	}

	stuff := router.Group("/stuff")
	{
		auth := stuff.Group("/auth")
		{
			auth.POST("/sign-in", h.StuffSignIn)
		}
		manager := stuff.Group("/manager")
		{
			// user := manager.Group("/user")
			// {

			// }
			driver := manager.Group("/driver")
			{
				driver.POST("/create", h.CreateDriver)
			}
		}
	}

	return router
}
