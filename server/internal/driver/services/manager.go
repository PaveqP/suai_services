package driver_services

import (
	"database/sql"
	"strconv"
	driver_models "taxi/internal/driver/models"
	driver_repositories "taxi/internal/driver/repositories"
	"time"
)

type ManagerService struct {
	r *driver_repositories.DriverRepository
}

func NewManagerService(repo *driver_repositories.DriverRepository) *ManagerService {
	return &ManagerService{r: repo}
}

func (ms *ManagerService) GetDriverInfo(driverId string) (*driver_models.DriverInfoResponse, error) {
	dbInfo, err := ms.r.Manager.GetDriverInfo(driverId)
	if err != nil {
		return nil, err
	}

	response := &driver_models.DriverInfoResponse{
		Name:        dbInfo.Name,
		Surname:     dbInfo.Surname,
		Lastname:    getNullableString(dbInfo.Lastname),
		Email:       dbInfo.Email,
		PhoneNumber: dbInfo.PhoneNumber,
		DriverLicense: &driver_models.DriversLicenseInfo{
			Name:            dbInfo.LicenseName,
			Surname:         dbInfo.LicenseSurname,
			Lastname:        getNullableString(dbInfo.LicenseLastname),
			Series:          dbInfo.LicenseSeries,
			DocNumber:       dbInfo.LicenseDocNumber,
			DateOfBirth:     getNullableString(dbInfo.LicenseDateOfBirth),
			PlaceOfBirth:    dbInfo.LicensePlaceOfBirth,
			DateOfIssue:     getNullableString(dbInfo.LicenseDateOfIssue),
			ValidUntil:      getNullableString(dbInfo.LicenseValidUntil),
			Residence:       dbInfo.LicenseResidence,
			IssuedUnit:      dbInfo.LicenseIssuedUnit,
			LicenseCategory: dbInfo.LicenseCategory,
		},
	}

	return response, nil
}

func (ms *ManagerService) UpdateDriverInfo(driverId string, req *driver_models.UpdateDriverInfoRequest) error {
	if req.Name != nil || req.Surname != nil || req.Lastname != nil || req.PhoneNumber != nil {
		updateData := ms.buildUpdateModel(req)
		err := ms.r.Manager.UpdateDriverInfo(driverId, updateData)
		if err != nil {
			return err
		}
	}

	if req.DriverLicense != nil {
		err := ms.r.Manager.UpdateDriverLicense(driverId, req.DriverLicense)
		if err != nil {
			return err
		}
	}

	return nil
}

func (ms *ManagerService) buildUpdateModel(req *driver_models.UpdateDriverInfoRequest) *driver_models.DBDriver {
	driver := &driver_models.DBDriver{}

	if req.Name != nil {
		driver.Name = *req.Name
	}
	if req.Surname != nil {
		driver.Surname = *req.Surname
	}
	if req.Lastname != nil {
		driver.Lastname = sql.NullString{
			String: *req.Lastname,
			Valid:  true,
		}
	} else {
		driver.Lastname = sql.NullString{Valid: false}
	}
	if req.PhoneNumber != nil {
		driver.PhoneNumber = *req.PhoneNumber
	}

	return driver
}

func (ms *ManagerService) GetDriverOrders(driverId string) (*[]driver_models.DriverOrderResponse, error) {
	dbOrders, err := ms.r.Manager.GetDriverOrders(driverId)
	if err != nil {
		return nil, err
	}

	var orders []driver_models.DriverOrderResponse
	for _, dbOrder := range *dbOrders {
		order := driver_models.DriverOrderResponse{
			Id:                strconv.Itoa(dbOrder.Id),
			City:              dbOrder.City,
			StartTripStreet:   dbOrder.StartTripStreet,
			StartTripHouse:    dbOrder.StartTripHouse,
			StartTripBuild:    getNullableString(dbOrder.StartTripBuild),
			DestinationStreet: dbOrder.DestinationStreet,
			DestinationHouse:  dbOrder.DestinationHouse,
			DestinationBuild:  getNullableString(dbOrder.DestinationBuild),
			ServiceCategory:   getNullableString(dbOrder.ServiceCategory),
			Status:            dbOrder.Status,
			Price:             dbOrder.Price,
			CreatedAt:         dbOrder.CreatedAt,
		}

		var options driver_models.OrderOptions
		if dbOrder.Child.Valid && dbOrder.Child.Bool {
			options.Child = &dbOrder.Child.Bool
		}
		if dbOrder.Pet.Valid && dbOrder.Pet.Bool {
			options.Pet = &dbOrder.Pet.Bool
		}
		if options.Child != nil || options.Pet != nil {
			order.Options = &options
		}

		orders = append(orders, order)
	}

	return &orders, nil
}

func (ms *ManagerService) AcceptOrder(orderId string, driverId string) error {
	return ms.r.Manager.AcceptOrder(orderId, driverId)
}

func (ms *ManagerService) StartTrip(orderId string, driverId string) error {
	return ms.r.Manager.StartTrip(orderId, driverId)
}

func (ms *ManagerService) CompleteOrder(orderId string, driverId string) error {
	return ms.r.Manager.CompleteOrder(orderId, driverId)
}

func (ms *ManagerService) GetDriverCars(driverId string) (*[]driver_models.CarInfo, error) {
	dbCars, err := ms.r.Manager.GetDriverCars(driverId)
	if err != nil {
		return nil, err
	}

	driverCarId, err := ms.r.Manager.GetDriverCarId(driverId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	var cars []driver_models.CarInfo
	for _, dbCar := range *dbCars {
		carId := strconv.Itoa(dbCar.Id)
		isActive := false
		if driverCarId != "" && driverCarId == carId {
			isActive = true
		}

		car := driver_models.CarInfo{
			Id:           &carId,
			Brand:        dbCar.Brand,
			Model:        dbCar.Model,
			Color:        dbCar.Color,
			LicensePlate: dbCar.GovernmentNumber,
			IsActive:     &isActive,
		}
		cars = append(cars, car)
	}

	return &cars, nil
}

func (ms *ManagerService) AddCar(driverId string, car *driver_models.CarInfo) error {
	currentTime := time.Now().Format("2006-01-02")
	futureTime := time.Now().AddDate(1, 0, 0).Format("2006-01-02")

	addCarReq := &driver_models.AddCarRequest{
		Brand:           car.Brand,
		Model:           car.Model,
		Year:            car.Year,
		Color:           car.Color,
		LicensePlate:    car.LicensePlate,
		VIN:             "VIN_" + car.LicensePlate,
		Passport:        "PASSPORT_" + car.LicensePlate,
		ServiceCategory: "econom",
		Insurance: driver_models.InsuranceInfo{
			InsuranceFrom:   currentTime,
			InsuranceUntil:  futureTime,
			InsuranceNumber: "INS_" + car.LicensePlate,
		},
	}

	_, err := ms.r.Manager.AddCar(driverId, addCarReq)
	return err
}

func (ms *ManagerService) AddPaymentInfo(driverId string, paymentInfo *driver_models.PaymentInfoRequest) error {
	return ms.r.Manager.AddPaymentInfo(driverId, paymentInfo)
}

func (ms *ManagerService) GetShifts(driverId string) (*[]driver_models.ShiftInfo, error) {
	dbShifts, err := ms.r.Manager.GetShifts(driverId)
	if err != nil {
		return nil, err
	}

	var shifts []driver_models.ShiftInfo
	for _, dbShift := range *dbShifts {
		shiftId := strconv.Itoa(dbShift.Id)
		var endTime *string
		if dbShift.EndTime.Valid {
			endTimeStr := dbShift.EndTime.String
			endTime = &endTimeStr
		}

		status := "ended"
		if endTime == nil {
			status = "active"
		}

		shift := driver_models.ShiftInfo{
			Id:        shiftId,
			StartTime: dbShift.StartTime,
			EndTime:   endTime,
			Status:    status,
		}

		if status == "active" {
			totalOrders, totalEarnings, err := ms.r.Manager.GetShiftOrders(shiftId)
			if err == nil {
				shift.TotalOrders = &totalOrders
				shift.TotalEarnings = &totalEarnings
			}
		} else if dbShift.TotalAmount.Valid {
			totalEarnings := dbShift.TotalAmount.Float64
			shift.TotalEarnings = &totalEarnings
		}

		shifts = append(shifts, shift)
	}

	return &shifts, nil
}

func (ms *ManagerService) GetActiveShift(driverId string) (*driver_models.ShiftInfo, error) {
	dbShift, err := ms.r.Manager.GetActiveShift(driverId)
	if err != nil {
		return nil, err
	}
	if dbShift == nil {
		return nil, nil
	}

	shiftId := strconv.Itoa(dbShift.Id)
	var endTime *string
	if dbShift.EndTime.Valid {
		endTimeStr := dbShift.EndTime.String
		endTime = &endTimeStr
	}

	status := "active"
	if endTime != nil {
		status = "ended"
	}

	shift := &driver_models.ShiftInfo{
		Id:        shiftId,
		StartTime: dbShift.StartTime,
		EndTime:   endTime,
		Status:    status,
	}

	if status == "active" {
		totalOrders, totalEarnings, err := ms.r.Manager.GetShiftOrders(shiftId)
		if err == nil {
			shift.TotalOrders = &totalOrders
			shift.TotalEarnings = &totalEarnings
		}
	}

	return shift, nil
}

func (ms *ManagerService) StartShift(driverId string) (*driver_models.StartShiftResponse, error) {
	shiftId, err := ms.r.Manager.StartShift(driverId)
	if err != nil {
		return nil, err
	}

	return &driver_models.StartShiftResponse{
		ShiftId: shiftId,
		Message: "Shift started successfully",
	}, nil
}

func (ms *ManagerService) EndShift(shiftId string, driverId string) (*driver_models.EndShiftResponse, error) {
	totalOrders, totalEarnings, err := ms.r.Manager.EndShift(shiftId, driverId)
	if err != nil {
		return nil, err
	}

	return &driver_models.EndShiftResponse{
		ShiftId:       shiftId,
		TotalOrders:   totalOrders,
		TotalEarnings: totalEarnings,
		Message:       "Shift ended successfully",
	}, nil
}

func getNullableString(nullString sql.NullString) string {
	if nullString.Valid {
		return nullString.String
	}
	return ""
}
