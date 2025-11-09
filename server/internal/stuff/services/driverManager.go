package stuff_services

import (
	driver_models "taxi/internal/driver/models"
	driver_repositories "taxi/internal/driver/repositories"
	stuff_repositories "taxi/internal/stuff/repositories"

	"golang.org/x/crypto/bcrypt"
)

type DriverManagerService struct {
	sr *stuff_repositories.StuffRepository
	dr *driver_repositories.DriverRepository
}

func NewDriverManagerService(sr *stuff_repositories.StuffRepository, dr *driver_repositories.DriverRepository) *DriverManagerService {
	return &DriverManagerService{sr, dr}
}

func (dmc *DriverManagerService) CreateDriver(credentials driver_models.CreateDriverParams) error {
	hashedPassword, err := dmc.hashPassword(credentials.Password)
	if err != nil {
		return err
	}
	credentials.Password = hashedPassword
	return dmc.dr.Auth.CreateDriver(credentials)
}

func (dmc *DriverManagerService) BlockDriver(driverId string, reason string) error {
	return nil
}

func (dmc *DriverManagerService) hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}
