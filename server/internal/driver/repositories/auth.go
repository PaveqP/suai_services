package driver_repositories

import (
	driver_models "taxi/internal/driver/models"
	"time"

	"github.com/jmoiron/sqlx"
)

type AuthRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) *AuthRepository {
	return &AuthRepository{db}
}

func (ar *AuthRepository) CreateDriver(driver driver_models.CreateDriverParams) error {
	trx, err := ar.db.Begin()
	if err != nil {
		return err
	}
	defer trx.Rollback()

	isActive := false
	verified := false
	createdAt := time.Now().Truncate(time.Microsecond)
	updatedAt := time.Now().Truncate(time.Microsecond)

	CreateDriverLicenseQuery := `INSERT INTO 
	drivers_license (name, surname, lastname, series, 
	doc_number, date_of_birth, place_of_birth, date_of_issue, 
	valid_until, residence, issued_unit, created_at, updated_at) 
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`
	var licenseId int
	err = trx.QueryRow(CreateDriverLicenseQuery, driver.DriverLicense.Name,
		driver.DriverLicense.Surname, driver.DriverLicense.Lastname,
		driver.DriverLicense.Series, driver.DriverLicense.DocNumber, driver.DriverLicense.DateOfBirth,
		driver.DriverLicense.PlaceOfBirth, driver.DriverLicense.DateOfIssue,
		driver.DriverLicense.ValidUntil, driver.DriverLicense.Residence, driver.DriverLicense.IssuedUnit, createdAt, updatedAt).Scan(&licenseId)
	if err != nil {
		trx.Rollback()
		return err
	}

	var licenseCategoryId string
	GetLicenseCategoryIdQuery := `SELECT id FROM license_category WHERE name = $1`
	err = trx.QueryRow(GetLicenseCategoryIdQuery, driver.DriverLicense.LicenseCategory).Scan(&licenseCategoryId)
	if err != nil {
		trx.Rollback()
		return err
	}

	CreateLinkDriverLicenseToCategoryQuery := `INSERT INTO driver_license_category (driver_license_id, category_id) VALUES ($1, $2)`
	_, err = trx.Exec(CreateLinkDriverLicenseToCategoryQuery, licenseId, licenseCategoryId)
	if err != nil {
		trx.Rollback()
		return err
	}

	CreateDriverQuery := `INSERT INTO driver (name, surname, email, hashed_password, phone_number, verified, document_id, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`
	var driverId string
	err = trx.QueryRow(CreateDriverQuery, driver.Name, driver.Surname, driver.Email, driver.Password, driver.PhoneNumber, verified, licenseId, isActive, createdAt, updatedAt).Scan(&driverId)
	if err != nil {
		trx.Rollback()
		return err
	}

	if err := trx.Commit(); err != nil {
		return err
	}

	return nil
}

func (ar *AuthRepository) GetDriverCredentials(email string) (*driver_models.ReturningDriverCredentials, error) {
	query := `SELECT id, hashed_password from driver WHERE email = $1`
	var driverCredentials driver_models.ReturningDriverCredentials
	if err := ar.db.Get(&driverCredentials, query, email); err != nil {
		return nil, err
	}

	return &driverCredentials, nil
}
