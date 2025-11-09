package main

import (
	driver_repositories "taxi/internal/driver/repositories"
	driver_services "taxi/internal/driver/services"
	"taxi/internal/handlers"
	"taxi/internal/jwt"
	"taxi/internal/server"
	"taxi/internal/shared"
	stuff_repositories "taxi/internal/stuff/repositories"
	stuff_services "taxi/internal/stuff/services"
	user_repositories "taxi/internal/user/repositories"
	user_services "taxi/internal/user/services"
	"time"

	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

func main() {
	postgresDb, err := shared.ConnectPostgresDb(&shared.Config{
		Host:     "localhost",
		Port:     "5455",
		Username: "postgres",
		Password: "12345",
		DBName:   "taxi-db",
		SSLMode:  "disable",
	})
	if err != nil {
		logrus.Fatalf("Failed connect to postgres DB: %s", err)
	}

	userRepositories := user_repositories.NewRepository(postgresDb)
	driverRepositories := driver_repositories.NewRepository(postgresDb)
	stuffRepositories := stuff_repositories.NewRepository(postgresDb)
	jwtService := jwt.NewJwtService(&jwt.JWTConfig{
		AccessTTL:         time.Duration(12) * time.Hour,
		RefreshTTL:        time.Duration(168) * time.Hour,
		AccessSigningKey:  "vjdsbvhvdv4t634123vbvdsvds6r3t12vjvdsvew32432dsvsdvsds",
		RefreshSigningKey: "432432kbkhjvb32424532njbvdklvdf43242",
	})
	userServices := user_services.NewService(userRepositories, jwtService)
	driverServices := driver_services.NewService(driverRepositories, jwtService)
	stuffServices := stuff_services.NewService(stuffRepositories, userRepositories, driverRepositories, jwtService)
	handlers := handlers.NewHandler(userServices, driverServices, stuffServices)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: false,
		Debug:            false,
	})

	corsRoutes := c.Handler(handlers.InitRoutes())

	server := new(server.Server)

	if err := server.Run("8080", corsRoutes); err != nil {
		logrus.Fatalf("Failed to start server at :8080. %s", err)
	}
}
