package driver_models

import "database/sql"

type CreateDriverParams struct {
	Name          string         `json:"name"`
	Surname       string         `json:"surname"`
	Email         string         `json:"email"`
	Password      string         `json:"password"`
	PhoneNumber   string         `json:"phone_number"`
	DriverLicense DriversLicense `json:"driver_license"`
}

type DriverCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ReturningDriverCredentials struct {
	Id       string `json:"id" db:"id"`
	Password string `json:"password" db:"hashed_password"`
}

type DriversLicense struct {
	Name            string `json:"name" db:"name"`
	Surname         string `json:"surname" db:"surname"`
	Lastname        string `json:"lastname" db:"lastname"`
	Series          string `json:"series" db:"series"`
	DocNumber       string `json:"doc_number" db:"doc_number"`
	DateOfBirth     string `json:"date_of_birth" db:"date_of_birth"`
	PlaceOfBirth    string `json:"place_of_birth" db:"place_of_birth"`
	DateOfIssue     string `json:"date_of_issue" db:"date_of_issue"`
	ValidUntil      string `json:"valid_until" db:"valid_until"`
	Residence       string `json:"residence" db:"residence"`
	IssuedUnit      string `json:"issued_unit" db:"issued_unit"`
	LicenseCategory string `json:"license_category" db:"license_category"`
}

type DriverInfoResponse struct {
	Name          string              `json:"name"`
	Surname       string              `json:"surname"`
	Lastname      string              `json:"lastname"`
	Email         string              `json:"email"`
	PhoneNumber   string              `json:"phone_number"`
	DriverLicense *DriversLicenseInfo `json:"driver_license"`
}

type DriversLicenseInfo struct {
	Name            string `json:"name"`
	Surname         string `json:"surname"`
	Lastname        string `json:"lastname"`
	Series          string `json:"series"`
	DocNumber       string `json:"doc_number"`
	DateOfBirth     string `json:"date_of_birth"`
	PlaceOfBirth    string `json:"place_of_birth"`
	DateOfIssue     string `json:"date_of_issue"`
	ValidUntil      string `json:"valid_until"`
	Residence       string `json:"residence"`
	IssuedUnit      string `json:"issued_unit"`
	LicenseCategory string `json:"license_category"`
}

type DBDriverInfo struct {
	Name                string         `db:"name"`
	Surname             string         `db:"surname"`
	Lastname            sql.NullString `db:"lastname"`
	Email               string         `db:"email"`
	PhoneNumber         string         `db:"phone_number"`
	LicenseName         string         `db:"license_name"`
	LicenseSurname      string         `db:"license_surname"`
	LicenseLastname     sql.NullString `db:"license_lastname"`
	LicenseSeries       string         `db:"license_series"`
	LicenseDocNumber    string         `db:"license_doc_number"`
	LicenseDateOfBirth  sql.NullString `db:"license_date_of_birth"`
	LicensePlaceOfBirth string         `db:"license_place_of_birth"`
	LicenseDateOfIssue  sql.NullString `db:"license_date_of_issue"`
	LicenseValidUntil   sql.NullString `db:"license_valid_until"`
	LicenseResidence    string         `db:"license_residence"`
	LicenseIssuedUnit   string         `db:"license_issued_unit"`
	LicenseCategory     string         `db:"license_category"`
}

type UpdateDriverInfoRequest struct {
	Name          *string             `json:"name"`
	Surname       *string             `json:"surname"`
	Lastname      *string             `json:"lastname"`
	PhoneNumber   *string             `json:"phone_number"`
	DriverLicense *DriversLicenseInfo `json:"driver_license"`
}

type DBDriver struct {
	Name        string         `db:"name"`
	Surname     string         `db:"surname"`
	Lastname    sql.NullString `db:"lastname"`
	Email       string         `db:"email"`
	PhoneNumber string         `db:"phone_number"`
}

type CarInfo struct {
	Id           *string `json:"id"`
	Brand        string  `json:"brand"`
	Model        string  `json:"model"`
	Year         string  `json:"year"`
	Color        string  `json:"color"`
	LicensePlate string  `json:"license_plate"`
	IsActive     *bool   `json:"is_active"`
}

type AddCarRequest struct {
	Brand           string        `json:"brand"`
	Model           string        `json:"model"`
	Year            string        `json:"year"`
	Color           string        `json:"color"`
	LicensePlate    string        `json:"license_plate"`
	VIN             string        `json:"vin"`
	Passport        string        `json:"passport"`
	ServiceCategory string        `json:"service_category"`
	Insurance       InsuranceInfo `json:"insurance"`
}

type InsuranceInfo struct {
	InsuranceFrom   string `json:"insurance_from"`
	InsuranceUntil  string `json:"insurance_until"`
	InsuranceNumber string `json:"insurance_number"`
}

type DBCar struct {
	Id               int     `db:"id"`
	Brand            string  `db:"brand"`
	Model            string  `db:"model"`
	GovernmentNumber string  `db:"government_number"`
	Color            string  `db:"color"`
	ServiceCategory  *string `db:"service_category"`
}

type DriverOrderResponse struct {
	Id                string        `json:"id"`
	City              string        `json:"city"`
	StartTripStreet   string        `json:"start_trip_street"`
	StartTripHouse    string        `json:"start_trip_house"`
	StartTripBuild    string        `json:"start_trip_build"`
	DestinationStreet string        `json:"destination_street"`
	DestinationHouse  string        `json:"destination_house"`
	DestinationBuild  string        `json:"destination_build"`
	ServiceCategory   string        `json:"service_category"`
	Status            string        `json:"status"`
	Price             float64       `json:"price"`
	Options           *OrderOptions `json:"options"`
	CreatedAt         string        `json:"created_at"`
}

type OrderOptions struct {
	Child *bool `json:"child"`
	Pet   *bool `json:"pet"`
}

type DBOrder struct {
	Id                int            `db:"id"`
	City              string         `db:"city"`
	StartTripStreet   string         `db:"start_trip_street"`
	StartTripHouse    string         `db:"start_trip_house"`
	StartTripBuild    sql.NullString `db:"start_trip_build"`
	DestinationStreet string         `db:"destination_street"`
	DestinationHouse  string         `db:"destination_house"`
	DestinationBuild  sql.NullString `db:"destination_build"`
	ServiceCategory   sql.NullString `db:"service_category"`
	Status            string         `db:"status"`
	Price             float64        `db:"price"`
	Child             sql.NullBool   `db:"child"`
	Pet               sql.NullBool   `db:"pet"`
	CreatedAt         string         `db:"created_at"`
}

type ShiftInfo struct {
	Id            string   `json:"id"`
	StartTime     string   `json:"start_time"`
	EndTime       *string  `json:"end_time"`
	Status        string   `json:"status"`
	TotalOrders   *int     `json:"total_orders"`
	TotalEarnings *float64 `json:"total_earnings"`
}

type DBShift struct {
	Id          int             `db:"id"`
	Date        string          `db:"date"`
	StartTime   string          `db:"start_time"`
	EndTime     sql.NullString  `db:"end_time"`
	TotalAmount sql.NullFloat64 `db:"total_amount"`
}

type StartShiftResponse struct {
	ShiftId string `json:"shift_id"`
	Message string `json:"message"`
}

type EndShiftResponse struct {
	ShiftId       string  `json:"shift_id"`
	TotalOrders   int     `json:"total_orders"`
	TotalEarnings float64 `json:"total_earnings"`
	Message       string  `json:"message"`
}

type PaymentInfoRequest struct {
	BankName          string `json:"bank_name"`
	CardHolderName    string `json:"card_holder_name"`
	CardHolderSurname string `json:"card_holder_surname"`
	CardNumber        string `json:"card_number"`
	ValidUntil        string `json:"valid_until"`
	CvvCode           string `json:"cvv_code"`
}
