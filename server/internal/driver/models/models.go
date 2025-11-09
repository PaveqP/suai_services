package driver_models

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
