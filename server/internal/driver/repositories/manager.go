package driver_repositories

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	driver_models "taxi/internal/driver/models"

	"golang.org/x/crypto/bcrypt"

	"github.com/jmoiron/sqlx"
)

type ManagerRepository struct {
	db *sqlx.DB
}

func NewManagerRepository(db *sqlx.DB) *ManagerRepository {
	return &ManagerRepository{db: db}
}

func (mr *ManagerRepository) GetDriverInfo(driverId string) (*driver_models.DBDriverInfo, error) {
	query := `
		SELECT 
			d.name,
			d.surname,
			d.lastname,
			d.email,
			d.phone_number,
			dl.name as license_name,
			dl.surname as license_surname,
			dl.lastname as license_lastname,
			dl.series as license_series,
			dl.doc_number as license_doc_number,
			dl.date_of_birth as license_date_of_birth,
			dl.place_of_birth as license_place_of_birth,
			dl.date_of_issue as license_date_of_issue,
			dl.valid_until as license_valid_until,
			dl.residence as license_residence,
			dl.issued_unit as license_issued_unit,
			COALESCE(string_agg(DISTINCT lc.name, ', '), '') as license_category
		FROM driver d
		JOIN drivers_license dl ON d.document_id = dl.id
		LEFT JOIN driver_license_category dlc ON dl.id = dlc.driver_license_id
		LEFT JOIN license_category lc ON dlc.category_id = lc.id
		WHERE d.id = $1
		GROUP BY d.id, d.name, d.surname, d.lastname, d.email, d.phone_number,
		         dl.name, dl.surname, dl.lastname, dl.series, dl.doc_number,
		         dl.date_of_birth, dl.place_of_birth, dl.date_of_issue,
		         dl.valid_until, dl.residence, dl.issued_unit
	`
	var driverInfo driver_models.DBDriverInfo
	err := mr.db.Get(&driverInfo, query, driverId)
	if err != nil {
		return nil, err
	}
	return &driverInfo, nil
}

func (mr *ManagerRepository) UpdateDriverInfo(driverId string, updateData *driver_models.DBDriver) error {
	query := `
		UPDATE driver 
		SET name = $1, surname = $2, lastname = $3, phone_number = $4, updated_at = NOW()
		WHERE id = $5
	`
	var lastname sql.NullString
	if updateData.Lastname.Valid {
		lastname = updateData.Lastname
	}

	_, err := mr.db.Exec(query, updateData.Name, updateData.Surname, lastname, updateData.PhoneNumber, driverId)
	return err
}

func (mr *ManagerRepository) UpdateDriverLicense(driverId string, license *driver_models.DriversLicenseInfo) error {
	var licenseId int
	query := `SELECT document_id FROM driver WHERE id = $1`
	err := mr.db.Get(&licenseId, query, driverId)
	if err != nil {
		return err
	}

	updateQuery := `
		UPDATE drivers_license 
		SET name = $1, surname = $2, lastname = $3, series = $4, doc_number = $5,
		    date_of_birth = $6, place_of_birth = $7, date_of_issue = $8,
		    valid_until = $9, residence = $10, issued_unit = $11, updated_at = NOW()
		WHERE id = $12
	`

	var lastname sql.NullString
	if license.Lastname != "" {
		lastname = sql.NullString{String: license.Lastname, Valid: true}
	}

	_, err = mr.db.Exec(updateQuery, license.Name, license.Surname, lastname,
		license.Series, license.DocNumber, license.DateOfBirth, license.PlaceOfBirth,
		license.DateOfIssue, license.ValidUntil, license.Residence, license.IssuedUnit, licenseId)

	if err != nil {
		return err
	}

	if license.LicenseCategory != "" {
		var categoryId string
		getCategoryQuery := `SELECT id FROM license_category WHERE name = $1`
		err = mr.db.Get(&categoryId, getCategoryQuery, license.LicenseCategory)
		if err != nil {
			return err
		}

		deleteQuery := `DELETE FROM driver_license_category WHERE driver_license_id = $1`
		_, err = mr.db.Exec(deleteQuery, licenseId)
		if err != nil {
			return err
		}

		insertQuery := `INSERT INTO driver_license_category (driver_license_id, category_id) VALUES ($1, $2)`
		_, err = mr.db.Exec(insertQuery, licenseId, categoryId)
		if err != nil {
			return err
		}
	}

	return nil
}

func (mr *ManagerRepository) GetDriverOrders(driverId string) (*[]driver_models.DBOrder, error) {
	query := `
		SELECT 
			o.id,
			o.city,
			o.start_trip_street,
			o.start_trip_house,
			o.start_trip_build,
			o.destination_street,
			o.destination_house,
			o.destination_build,
			sc.name as service_category,
			o.status,
			o.price,
			BOOL_OR(s.name = 'child') as child,
			BOOL_OR(s.name = 'pet') as pet,
			o.created_at::text as created_at
		FROM "order" o
		LEFT JOIN service_category sc ON o.service_category_id = sc.id
		LEFT JOIN order_service os ON o.id = os.order_id
		LEFT JOIN service s ON os.service_id = s.id
		WHERE (o.status IN ('pending', 'Created') AND (o.driver_id = 0 OR o.driver_id IS NULL OR o.driver_id::text = '0')) 
		   OR (o.driver_id::text = $1 AND o.status IN ('accepted', 'in_progress'))
		GROUP BY o.id, o.city, o.start_trip_street, o.start_trip_house, o.start_trip_build,
		         o.destination_street, o.destination_house, o.destination_build,
		         sc.name, o.status, o.price, o.created_at
		ORDER BY o.created_at DESC
	`
	var orders []driver_models.DBOrder
	err := mr.db.Select(&orders, query, driverId)
	if err != nil {
		return nil, err
	}
	return &orders, nil
}

func (mr *ManagerRepository) AcceptOrder(orderId string, driverId string) error {
	trx, err := mr.db.Begin()
	if err != nil {
		return err
	}
	defer trx.Rollback()

	var currentStatus string
	var currentDriverId sql.NullString
	checkQuery := `SELECT status, driver_id::text FROM "order" WHERE id = $1`
	err = trx.QueryRow(checkQuery, orderId).Scan(&currentStatus, &currentDriverId)
	if err != nil {
		trx.Rollback()
		return err
	}

	if currentStatus != "pending" && currentStatus != "Created" {
		trx.Rollback()
		return errors.New("order is not available for acceptance")
	}

	if currentDriverId.Valid && currentDriverId.String != driverId && currentDriverId.String != "0" && currentDriverId.String != "" {
		trx.Rollback()
		return errors.New("order is already assigned to another driver")
	}

	updateQuery := `UPDATE "order" SET status = 'accepted', driver_id = $1, updated_at = NOW() WHERE id = $2`
	_, err = trx.Exec(updateQuery, driverId, orderId)
	if err != nil {
		trx.Rollback()
		return err
	}

	var activeShiftId sql.NullInt64
	getActiveShiftQuery := `SELECT id FROM work_shift WHERE driver_id = $1 AND end_time = '00:00:00' LIMIT 1`
	err = trx.QueryRow(getActiveShiftQuery, driverId).Scan(&activeShiftId)
	if err == nil && activeShiftId.Valid {
		linkQuery := `INSERT INTO order_work_shift (order_id, work_shift_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
		_, err = trx.Exec(linkQuery, orderId, activeShiftId.Int64)
		if err != nil {
			trx.Rollback()
			return err
		}
	}

	if err := trx.Commit(); err != nil {
		return err
	}

	return nil
}

func (mr *ManagerRepository) StartTrip(orderId string, driverId string) error {
	trx, err := mr.db.Begin()
	if err != nil {
		return err
	}
	defer trx.Rollback()

	var orderStatus string
	checkQuery := `SELECT status FROM "order" WHERE id = $1 AND driver_id = $2`
	err = trx.QueryRow(checkQuery, orderId, driverId).Scan(&orderStatus)
	if err != nil {
		trx.Rollback()
		return errors.New("order not found or does not belong to driver")
	}

	if orderStatus != "accepted" {
		trx.Rollback()
		return errors.New("order must be accepted before starting trip")
	}

	updateQuery := `UPDATE "order" SET status = 'in_progress', updated_at = NOW() WHERE id = $1`
	_, err = trx.Exec(updateQuery, orderId)
	if err != nil {
		trx.Rollback()
		return err
	}

	if err := trx.Commit(); err != nil {
		return err
	}

	return nil
}

func (mr *ManagerRepository) CompleteOrder(orderId string, driverId string) error {
	trx, err := mr.db.Begin()
	if err != nil {
		return err
	}
	defer trx.Rollback()

	var orderPrice float64
	checkQuery := `SELECT price FROM "order" WHERE id = $1 AND driver_id = $2 AND status IN ('accepted', 'in_progress')`
	err = trx.QueryRow(checkQuery, orderId, driverId).Scan(&orderPrice)
	if err != nil {
		trx.Rollback()
		return errors.New("order not found or cannot be completed")
	}

	updateQuery := `UPDATE "order" SET status = 'completed', updated_at = NOW() WHERE id = $1`
	_, err = trx.Exec(updateQuery, orderId)
	if err != nil {
		trx.Rollback()
		return err
	}

	var activeShiftId sql.NullInt64
	getActiveShiftQuery := `SELECT id FROM work_shift WHERE driver_id = $1 AND end_time = '00:00:00' LIMIT 1`
	err = trx.QueryRow(getActiveShiftQuery, driverId).Scan(&activeShiftId)
	if err == nil && activeShiftId.Valid {
		var linkExists bool
		checkLinkQuery := `SELECT EXISTS(SELECT 1 FROM order_work_shift WHERE order_id = $1 AND work_shift_id = $2)`
		err = trx.QueryRow(checkLinkQuery, orderId, activeShiftId.Int64).Scan(&linkExists)
		if err == nil && !linkExists {
			linkQuery := `INSERT INTO order_work_shift (order_id, work_shift_id) VALUES ($1, $2)`
			_, err = trx.Exec(linkQuery, orderId, activeShiftId.Int64)
			if err != nil {
				trx.Rollback()
				return err
			}
		}
	}

	driverPercent := 0.70
	driverAmount := orderPrice * driverPercent
	createPaymentQuery := `
		INSERT INTO payment (order_id, payd_driver, drivers_percent, amount, type, status, created_at, updated_at)
		VALUES ($1, false, $2, $3, 'order_payment', 'pending', NOW(), NOW())
	`
	_, err = trx.Exec(createPaymentQuery, orderId, driverPercent, driverAmount)
	if err != nil {
		trx.Rollback()
		return err
	}

	if err := trx.Commit(); err != nil {
		return err
	}

	return nil
}

func (mr *ManagerRepository) GetDriverCars(driverId string) (*[]driver_models.DBCar, error) {
	query := `
		SELECT 
			c.id,
			c.brand,
			c.model,
			c.government_number,
			c.color,
			sc.name as service_category
		FROM car c
		LEFT JOIN service_category sc ON c.service_category_id = sc.id
		WHERE EXISTS (
			SELECT 1 FROM driver WHERE id = $1 AND car_id = c.id
		)
	`
	var cars []driver_models.DBCar
	err := mr.db.Select(&cars, query, driverId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	if cars == nil {
		cars = []driver_models.DBCar{}
	}

	return &cars, nil
}

func (mr *ManagerRepository) GetDriverCarId(driverId string) (string, error) {
	var carId sql.NullString
	query := `SELECT car_id::text FROM driver WHERE id = $1`
	err := mr.db.Get(&carId, query, driverId)
	if err != nil {
		return "", err
	}
	if carId.Valid {
		return carId.String, nil
	}
	return "", nil
}

func (mr *ManagerRepository) AddCar(driverId string, car *driver_models.AddCarRequest) (string, error) {
	trx, err := mr.db.Begin()
	if err != nil {
		return "", err
	}
	defer trx.Rollback()

	insuranceVerified := false
	createInsuranceQuery := `
		INSERT INTO insurance (insurance_from, insurance_until, insurance_number, insurance_verified, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id
	`
	var insuranceId int
	err = trx.QueryRow(createInsuranceQuery, car.Insurance.InsuranceFrom, car.Insurance.InsuranceUntil,
		car.Insurance.InsuranceNumber, insuranceVerified).Scan(&insuranceId)
	if err != nil {
		trx.Rollback()
		return "", err
	}

	var categoryId sql.NullInt64
	if car.ServiceCategory != "" {
		getCategoryQuery := `SELECT id FROM service_category WHERE name = $1`
		err = trx.QueryRow(getCategoryQuery, car.ServiceCategory).Scan(&categoryId)
		if err != nil {
			categoryId = sql.NullInt64{Valid: false}
		}
	}

	stsVerified := false
	createCarQuery := `
		INSERT INTO car (brand, model, government_number, vin, insurance_id, color, passport, sts_verified, service_category_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		RETURNING id
	`
	var carId int
	var serviceCategoryId sql.NullInt64
	if categoryId.Valid {
		serviceCategoryId = categoryId
	}
	err = trx.QueryRow(createCarQuery, car.Brand, car.Model, car.LicensePlate, car.VIN,
		insuranceId, car.Color, car.Passport, stsVerified, serviceCategoryId).Scan(&carId)
	if err != nil {
		trx.Rollback()
		return "", err
	}

	updateDriverQuery := `UPDATE driver SET car_id = $1, updated_at = NOW() WHERE id = $2`
	_, err = trx.Exec(updateDriverQuery, carId, driverId)
	if err != nil {
		trx.Rollback()
		return "", err
	}

	if err := trx.Commit(); err != nil {
		return "", err
	}

	return strconv.Itoa(carId), nil
}

func (mr *ManagerRepository) AddPaymentInfo(driverId string, paymentInfo *driver_models.PaymentInfoRequest) error {
	trx, err := mr.db.Begin()
	if err != nil {
		return err
	}
	defer trx.Rollback()

	hashedCVV, err := bcrypt.GenerateFromPassword([]byte(paymentInfo.CvvCode), bcrypt.DefaultCost)
	if err != nil {
		trx.Rollback()
		return err
	}

	verified := false
	createPaymentInfoQuery := `
		INSERT INTO payment_info (bank_name, card_holder_name, card_holder_surname, card_number, valid_until, cvv_code_hashed, verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id
	`
	var paymentInfoId int
	err = trx.QueryRow(createPaymentInfoQuery, paymentInfo.BankName, paymentInfo.CardHolderName,
		paymentInfo.CardHolderSurname, paymentInfo.CardNumber, paymentInfo.ValidUntil,
		string(hashedCVV), verified).Scan(&paymentInfoId)
	if err != nil {
		trx.Rollback()
		return err
	}

	linkQuery := `INSERT INTO driver_payment_info (driver_id, payment_info_id) VALUES ($1, $2)`
	_, err = trx.Exec(linkQuery, driverId, paymentInfoId)
	if err != nil {
		trx.Rollback()
		return err
	}

	if err := trx.Commit(); err != nil {
		return err
	}

	return nil
}

func (mr *ManagerRepository) GetShifts(driverId string) (*[]driver_models.DBShift, error) {
	query := `
		SELECT 
			id,
			date::text as date,
			(date || ' ' || start_time)::text as start_time,
			CASE WHEN end_time != '00:00:00' THEN (date || ' ' || end_time)::text ELSE NULL END as end_time,
			total_amount
		FROM work_shift
		WHERE driver_id = $1
		ORDER BY created_at DESC
	`
	var shifts []driver_models.DBShift
	err := mr.db.Select(&shifts, query, driverId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	if shifts == nil {
		shifts = []driver_models.DBShift{}
	}

	return &shifts, nil
}

func (mr *ManagerRepository) GetActiveShift(driverId string) (*driver_models.DBShift, error) {
	query := `
		SELECT 
			id,
			date::text as date,
			(date || ' ' || start_time)::text as start_time,
			CASE WHEN end_time != '00:00:00' THEN (date || ' ' || end_time)::text ELSE NULL END as end_time,
			total_amount
		FROM work_shift
		WHERE driver_id = $1 AND end_time = '00:00:00'
		ORDER BY created_at DESC
		LIMIT 1
	`
	var shift driver_models.DBShift
	err := mr.db.Get(&shift, query, driverId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &shift, nil
}

func (mr *ManagerRepository) StartShift(driverId string) (string, error) {
	activeShift, err := mr.GetActiveShift(driverId)
	if err != nil {
		return "", err
	}
	if activeShift != nil {
		return "", errors.New("there is already an active shift")
	}

	now := time.Now()
	date := now.Format("2006-01-02")
	startTime := now.Format("15:04:05")
	activeEndTime := "00:00:00"

	query := `
		INSERT INTO work_shift (date, start_time, end_time, driver_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id
	`
	var shiftId int
	err = mr.db.QueryRow(query, date, startTime, activeEndTime, driverId).Scan(&shiftId)
	if err != nil {
		return "", err
	}

	return strconv.Itoa(shiftId), nil
}

func (mr *ManagerRepository) EndShift(shiftId string, driverId string) (int, float64, error) {
	trx, err := mr.db.Begin()
	if err != nil {
		return 0, 0, err
	}
	defer trx.Rollback()

	var checkShiftId int
	checkQuery := `SELECT id FROM work_shift WHERE id = $1 AND driver_id = $2 AND end_time = '00:00:00'`
	err = trx.QueryRow(checkQuery, shiftId, driverId).Scan(&checkShiftId)
	if err != nil {
		trx.Rollback()
		return 0, 0, errors.New("shift not found or already ended")
	}

	totalOrders, totalEarnings, err := mr.GetShiftOrders(shiftId)
	if err != nil {
		trx.Rollback()
		return 0, 0, err
	}

	now := time.Now()
	endTime := now.Format("15:04:05")
	updateQuery := `
		UPDATE work_shift 
		SET end_time = $1, total_amount = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err = trx.Exec(updateQuery, endTime, totalEarnings, shiftId)
	if err != nil {
		trx.Rollback()
		return 0, 0, err
	}

	if err := trx.Commit(); err != nil {
		return 0, 0, err
	}

	return totalOrders, totalEarnings, nil
}

func (mr *ManagerRepository) GetShiftOrders(shiftId string) (int, float64, error) {
	query := `
		SELECT 
			COUNT(DISTINCT o.id) as total_orders,
			COALESCE(SUM(p.amount), 0) as total_earnings
		FROM order_work_shift ows
		JOIN "order" o ON ows.order_id = o.id
		LEFT JOIN payment p ON o.id = p.order_id
		WHERE ows.work_shift_id = $1 AND o.status = 'completed'
	`
	var totalOrders int
	var totalEarnings sql.NullFloat64
	err := mr.db.QueryRow(query, shiftId).Scan(&totalOrders, &totalEarnings)
	if err != nil {
		return 0, 0, err
	}

	var earnings float64
	if totalEarnings.Valid {
		earnings = totalEarnings.Float64
	}

	return totalOrders, earnings, nil
}

func (mr *ManagerRepository) CreatePaymentForOrder(orderId string, driverPercent float64) error {
	var orderPrice float64
	getPriceQuery := `SELECT price FROM "order" WHERE id = $1`
	err := mr.db.Get(&orderPrice, getPriceQuery, orderId)
	if err != nil {
		return err
	}

	driverAmount := orderPrice * driverPercent

	query := `
		INSERT INTO payment (order_id, payd_driver, drivers_percent, amount, type, status, created_at, updated_at)
		VALUES ($1, false, $2, $3, 'order_payment', 'pending', NOW(), NOW())
	`
	_, err = mr.db.Exec(query, orderId, driverPercent, driverAmount)
	return err
}
