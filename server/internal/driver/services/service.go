package driver_services

import (
	driver_models "taxi/internal/driver/models"
	driver_repositories "taxi/internal/driver/repositories"
	"taxi/internal/jwt"
)

type Auth interface {
	SignIn(credentials driver_models.DriverCredentials) (*jwt.TokensPair, error)
}

type Manager interface {
	GetDriverInfo(driverId string) (*driver_models.DriverInfoResponse, error)
	UpdateDriverInfo(driverId string, req *driver_models.UpdateDriverInfoRequest) error
	GetDriverOrders(driverId string) (*[]driver_models.DriverOrderResponse, error)
	AcceptOrder(orderId string, driverId string) error
	StartTrip(orderId string, driverId string) error
	CompleteOrder(orderId string, driverId string) error
	GetDriverCars(driverId string) (*[]driver_models.CarInfo, error)
	AddCar(driverId string, car *driver_models.CarInfo) error
	AddPaymentInfo(driverId string, paymentInfo *driver_models.PaymentInfoRequest) error
	GetShifts(driverId string) (*[]driver_models.ShiftInfo, error)
	GetActiveShift(driverId string) (*driver_models.ShiftInfo, error)
	StartShift(driverId string) (*driver_models.StartShiftResponse, error)
	EndShift(shiftId string, driverId string) (*driver_models.EndShiftResponse, error)
}

type DriverService struct {
	Auth
	Manager
}

func NewService(repo *driver_repositories.DriverRepository, jwt *jwt.JwtService) *DriverService {
	return &DriverService{
		Auth:    NewAuthService(repo, jwt),
		Manager: NewManagerService(repo),
	}
}
