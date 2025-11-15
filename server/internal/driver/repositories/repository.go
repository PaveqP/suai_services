package driver_repositories

import (
	driver_models "taxi/internal/driver/models"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	CreateDriver(driver driver_models.CreateDriverParams) error
	GetDriverCredentials(email string) (*driver_models.ReturningDriverCredentials, error)
}

type Manager interface {
	GetDriverInfo(driverId string) (*driver_models.DBDriverInfo, error)
	UpdateDriverInfo(driverId string, updateData *driver_models.DBDriver) error
	UpdateDriverLicense(driverId string, license *driver_models.DriversLicenseInfo) error
	GetDriverOrders(driverId string) (*[]driver_models.DBOrder, error)
	AcceptOrder(orderId string, driverId string) error
	StartTrip(orderId string, driverId string) error
	CompleteOrder(orderId string, driverId string) error
	GetDriverCars(driverId string) (*[]driver_models.DBCar, error)
	GetDriverCarId(driverId string) (string, error)
	AddCar(driverId string, car *driver_models.AddCarRequest) (string, error)
	AddPaymentInfo(driverId string, paymentInfo *driver_models.PaymentInfoRequest) error
	GetShifts(driverId string) (*[]driver_models.DBShift, error)
	GetActiveShift(driverId string) (*driver_models.DBShift, error)
	StartShift(driverId string) (string, error)
	EndShift(shiftId string, driverId string) (int, float64, error)
	GetShiftOrders(shiftId string) (int, float64, error)
	CreatePaymentForOrder(orderId string, driverPercent float64) error
}

type DriverRepository struct {
	Auth
	Manager
}

func NewRepository(db *sqlx.DB) *DriverRepository {
	return &DriverRepository{
		Auth:    NewAuthRepository(db),
		Manager: NewManagerRepository(db),
	}
}
