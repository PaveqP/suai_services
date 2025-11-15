package user_models

import (
	"database/sql"
)

type CreateUserParams struct {
	Name        string `json:"name"`
	Surname     string `json:"surname"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	PhoneNumber string `json:"phone_number"`
}

type UserCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ReturningUserCredentials struct {
	Id       string `json:"id" db:"id"`
	Password string `json:"password" db:"hashed_password"`
}

type UserInfo struct {
	Name        string         `json:"name" db:"name"`
	Surname     string         `json:"surname" db:"surname"`
	Lastname    sql.NullString `json:"lastname" db:"lastname"`
	Country     sql.NullString `json:"country" db:"country"`
	City        sql.NullString `json:"city" db:"city"`
	DateOfBirth sql.NullString `json:"date_of_birth" db:"date_of_birth"`
	Email       string         `json:"email" db:"email"`
	PhoneNumber string         `json:"phone_number" db:"phone_number"`
}

type UserInfoResponse struct {
	Name        string `json:"name" db:"name"`
	Surname     string `json:"surname" db:"surname"`
	Lastname    string `json:"lastname" db:"lastname"`
	Country     string `json:"country" db:"country"`
	City        string `json:"city" db:"city"`
	DateOfBirth string `json:"date_of_birth" db:"date_of_birth"`
	Email       string `json:"email" db:"email"`
	PhoneNumber string `json:"phone_number" db:"phone_number"`
}

type UpdateUserInfoRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
	Surname     *string `json:"surname,omitempty" validate:"omitempty,min=2,max=50"`
	Lastname    *string `json:"lastname,omitempty" validate:"omitempty,max=50"`
	Country     *string `json:"country,omitempty" validate:"omitempty,max=100"`
	City        *string `json:"city,omitempty" validate:"omitempty,max=100"`
	DateOfBirth *string `json:"date_of_birth,omitempty" validate:"omitempty,datetime=2006-01-02"`
	PhoneNumber *string `json:"phone_number,omitempty" validate:"omitempty,e164"`
}

type UpdateUserInfoResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type GetOrderPriceRequest struct {
	StartTripStreet   string `json:"start_trip_street" db:"start_trip_street"`
	StartTripHouse    string `json:"start_trip_house" db:"start_trip_house"`
	StartTripBuild    string `json:"start_trip_build,omitempty" db:"start_trip_build"`
	DestinationStreet string `json:"destination_street" db:"destination_street"`
	DestinationHouse  string `json:"destination_house" db:"destination_house"`
	DestinationBuild  string `json:"destination_build,omitempty" db:"destination_build"`
	ServiceCategory   string `json:"service_category"`
}

type CreateOrderRequest struct {
	City              string        `json:"city" db:"city"`
	StartTripStreet   string        `json:"start_trip_street" db:"start_trip_street"`
	StartTripHouse    string        `json:"start_trip_house" db:"start_trip_house"`
	StartTripBuild    string        `json:"start_trip_build,omitempty" db:"start_trip_build"`
	DestinationStreet string        `json:"destination_street" db:"destination_street"`
	DestinationHouse  string        `json:"destination_house" db:"destination_house"`
	DestinationBuild  string        `json:"destination_build,omitempty" db:"destination_build"`
	ServiceCategory   string        `json:"service_category"`
	Price             float64       `json:"price" db:"price"`
	Options           *OrderOptions `json:"options,omitempty"`
}

type OrderOptions struct {
	Child bool `json:"child" db:"child"`
	Pet   bool `json:"pet" db:"pet"`
}

type OrderResponse struct {
	Id                string  `json:"id" db:"id"`
	City              string  `json:"city" db:"city"`
	StartTripStreet   string  `json:"start_trip_street" db:"start_trip_street"`
	StartTripHouse    string  `json:"start_trip_house" db:"start_trip_house"`
	StartTripBuild    string  `json:"start_trip_build,omitempty" db:"start_trip_build"`
	DestinationStreet string  `json:"destination_street" db:"destination_street"`
	DestinationHouse  string  `json:"destination_house" db:"destination_house"`
	DestinationBuild  string  `json:"destination_build,omitempty" db:"destination_build"`
	ServiceCategory   string  `json:"service_category"`
	Status            string  `json:"status" db:"status"`
	Price             float64 `json:"price" db:"price"`
	DriverName        *string `json:"driver_name"`
	Car               *CarModelResponse
	Options           *OrderOptions `json:"options,omitempty"`
}

type CarModelResponse struct {
	Brand  string `json:"brand"`
	Model  string `json:"model"`
	Number string `json:"number"`
}

type DBOrder struct {
	Id                string       `json:"id" db:"id"`
	City              string       `db:"city"`
	StartTripStreet   string       `db:"start_trip_street"`
	StartTripHouse    string       `db:"start_trip_house"`
	StartTripBuild    *string      `db:"start_trip_build"`
	DestinationStreet string       `db:"destination_street"`
	DestinationHouse  string       `db:"destination_house"`
	DestinationBuild  *string      `db:"destination_build"`
	ServiceCategory   *string      `db:"service_category"`
	Status            string       `db:"status"`
	Price             float64      `db:"price"`
	DriverName        *string      `db:"driver_name"`
	Brand             *string      `db:"brand"`
	Model             *string      `db:"model"`
	Number            *string      `db:"number"`
	Child             sql.NullBool `db:"child"`
	Pet               sql.NullBool `db:"pet"`
}
