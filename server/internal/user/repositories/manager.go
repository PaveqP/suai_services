package user_repositories

import (
	"errors"
	"fmt"
	"strings"
	user_models "taxi/internal/user/models"

	"github.com/jmoiron/sqlx"
)

type ManagerRepository struct {
	db *sqlx.DB
}

func NewManagerRepository(db *sqlx.DB) *ManagerRepository {
	return &ManagerRepository{db}
}

func (mr *ManagerRepository) GetUserInfo(userId string) (*user_models.UserInfo, error) {
	query := `SELECT name, surname, lastname, country, city, date_of_birth, email, phone_number FROM "user" WHERE id = $1`
	var UserInfo user_models.UserInfo

	if err := mr.db.Get(&UserInfo, query, userId); err != nil {
		return nil, err
	}

	return &UserInfo, nil
}

func (mr *ManagerRepository) UpdateUserInfo(userID string, userInfo *user_models.UserInfo) error {
	query, args := mr.buildUpdateQuery(userID, userInfo)

	if query == "" {
		errors.New("Can not create query")
	}

	_, err := mr.db.Exec(query, args...)
	return err
}

func (mr *ManagerRepository) buildUpdateQuery(userID string, userInfo *user_models.UserInfo) (string, []interface{}) {
	var setClauses []string
	var args []interface{}
	argIndex := 1

	if userInfo.Name != "" {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, userInfo.Name)
		argIndex++
	}

	if userInfo.Surname != "" {
		setClauses = append(setClauses, fmt.Sprintf("surname = $%d", argIndex))
		args = append(args, userInfo.Surname)
		argIndex++
	}

	if userInfo.Lastname.Valid {
		setClauses = append(setClauses, fmt.Sprintf("lastname = $%d", argIndex))
		args = append(args, userInfo.Lastname.String)
		argIndex++
	} else {
		setClauses = append(setClauses, "lastname = NULL")
	}

	if userInfo.Country.Valid {
		setClauses = append(setClauses, fmt.Sprintf("country = $%d", argIndex))
		args = append(args, userInfo.Country.String)
		argIndex++
	} else {
		setClauses = append(setClauses, "country = NULL")
	}

	if userInfo.City.Valid {
		setClauses = append(setClauses, fmt.Sprintf("city = $%d", argIndex))
		args = append(args, userInfo.City.String)
		argIndex++
	} else {
		setClauses = append(setClauses, "city = NULL")
	}

	if userInfo.DateOfBirth.Valid {
		setClauses = append(setClauses, fmt.Sprintf("date_of_birth = $%d", argIndex))
		args = append(args, userInfo.DateOfBirth.String)
		argIndex++
	} else {
		setClauses = append(setClauses, "date_of_birth = NULL")
	}

	if userInfo.PhoneNumber != "" {
		setClauses = append(setClauses, fmt.Sprintf("phone_number = $%d", argIndex))
		args = append(args, userInfo.PhoneNumber)
		argIndex++
	}

	if len(setClauses) == 0 {
		return "", nil
	}

	setClauses = append(setClauses, fmt.Sprintf("updated_at = NOW()"))
	query := fmt.Sprintf(`UPDATE "user" SET %s WHERE id = $%d`,
		strings.Join(setClauses, ", "), argIndex)
	args = append(args, userID)

	return query, args
}

func (mr *ManagerRepository) GetUserOrders(userID string) (*[]user_models.OrderResponse, error) {
	var orders []user_models.DBOrder
	getOrdersQuery := `
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
            CONCAT(d.name, ' ', d.surname) as driver_name,
            c.brand,
            c.model,
            c.government_number as number,
            BOOL_OR(s.name = 'child') as child,
            BOOL_OR(s.name = 'pet') as pet
        FROM "order" o
        LEFT JOIN service_category sc ON o.service_category_id = sc.id
        LEFT JOIN driver d ON o.driver_id = d.id
        LEFT JOIN car c ON d.car_id = c.id
        LEFT JOIN order_service os ON o.id = os.order_id
        LEFT JOIN service s ON os.service_id = s.id
        WHERE o.user_id = $1
        GROUP BY 
            o.id, 
            o.city, 
            o.start_trip_street, 
            o.start_trip_house, 
            o.start_trip_build,
            o.destination_street, 
            o.destination_house, 
            o.destination_build,
            sc.name, 
            o.status, 
            o.price,
            d.name, 
            d.surname,
            c.brand, 
            c.model, 
            c.government_number
        ORDER BY o.created_at DESC
    `
	err := mr.db.Select(&orders, getOrdersQuery, userID)
	if err != nil {
		return nil, err
	}
	var response []user_models.OrderResponse
	for _, dbOrder := range orders {
		order := user_models.OrderResponse{
			Id:                dbOrder.Id,
			City:              dbOrder.City,
			StartTripStreet:   dbOrder.StartTripStreet,
			StartTripHouse:    dbOrder.StartTripHouse,
			DestinationStreet: dbOrder.DestinationStreet,
			DestinationHouse:  dbOrder.DestinationHouse,
			Status:            dbOrder.Status,
			Price:             dbOrder.Price,
			DriverName:        dbOrder.DriverName,
		}

		if dbOrder.StartTripBuild != nil {
			order.StartTripBuild = *dbOrder.StartTripBuild
		}
		if dbOrder.DestinationBuild != nil {
			order.DestinationBuild = *dbOrder.DestinationBuild
		}
		if dbOrder.ServiceCategory != nil {
			order.ServiceCategory = *dbOrder.ServiceCategory
		}

		if dbOrder.Brand != nil && dbOrder.Model != nil && dbOrder.Number != nil {
			order.Car = &user_models.CarModelResponse{
				Brand:  *dbOrder.Brand,
				Model:  *dbOrder.Model,
				Number: *dbOrder.Number,
			}
		}

		if dbOrder.Child.Valid || dbOrder.Pet.Valid {
			order.Options = &user_models.OrderOptions{
				Child: dbOrder.Child.Bool,
				Pet:   dbOrder.Pet.Bool,
			}
		}

		response = append(response, order)
	}
	return &response, nil
}

func (mr *ManagerRepository) CreateOrder(userId string, order *user_models.CreateOrderRequest) (string, error) {
	trx, err := mr.db.Begin()
	if err != nil {
		return "", err
	}
	defer trx.Rollback()

	getCategoryIdQuery := `SELECT id FROM service_category WHERE name = $1`
	var categoryId string

	err = trx.QueryRow(getCategoryIdQuery, order.ServiceCategory).Scan(&categoryId)
	if err != nil {
		trx.Rollback()
		return "", err
	}

	createOrderQuery := `
        INSERT INTO "order" (
            city, start_trip_street, start_trip_house, start_trip_build,
            destination_street, destination_house, destination_build,
            service_category_id, status, price, user_id,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING id
    `

	var orderId string
	err = trx.QueryRow(createOrderQuery, order.City, order.StartTripStreet, order.StartTripHouse,
		order.StartTripBuild, order.DestinationStreet, order.DestinationHouse, order.DestinationBuild,
		categoryId, "Created", order.Price, userId).Scan(&orderId)
	if err != nil {
		trx.Rollback()
		return "", err
	}

	if order.Options != nil {
		var childOptionId string
		var petOptionId string
		if order.Options.Child {
			queryGetChildOptionId := "SELECT id FROM service WHERE name = $1"
			err = trx.QueryRow(queryGetChildOptionId, "child").Scan(&childOptionId)
			if err != nil {
				trx.Rollback()
				return "", err
			}

			var childOptionExists bool
			canAddChildOption := "SELECT EXISTS(SELECT 1 FROM service_category_service WHERE service_category_id = $1 AND service_id = $2)"
			err = trx.QueryRow(canAddChildOption, categoryId, childOptionId).Scan(&childOptionExists)
			if err != nil {
				trx.Rollback()
				return "", err
			}
			if !childOptionExists {
				return "", fmt.Errorf("options child not exists in class: %s", order.ServiceCategory)
			}

			queryAddChildOption := `INSERT INTO order_service (order_id, service_id) VALUES ($1, $2)`
			_, err = trx.Exec(queryAddChildOption, orderId, childOptionId)
			if err != nil {
				trx.Rollback()
				return "", err
			}
		}
		if order.Options.Pet {
			queryGetPetOptionId := "SELECT id FROM service WHERE name = $1"
			err = trx.QueryRow(queryGetPetOptionId, "pet").Scan(&petOptionId)
			if err != nil {
				trx.Rollback()
				return "", err
			}
			var petOptionExists bool
			canAddChildOption := "SELECT EXISTS(SELECT 1 FROM service_category_service WHERE service_category_id = $1 AND service_id = $2)"
			err = trx.QueryRow(canAddChildOption, categoryId, petOptionId).Scan(&petOptionExists)
			if err != nil {
				trx.Rollback()
				return "", err
			}
			if !petOptionExists {
				return "", fmt.Errorf("options pet not exists in class: %s", order.ServiceCategory)
			}

			queryAddPetOption := `INSERT INTO order_service (order_id, service_id) VALUES ($1, $2)`
			_, err = trx.Exec(queryAddPetOption, orderId, petOptionId)
			if err != nil {
				trx.Rollback()
				return "", err
			}
		}
	}

	if err := trx.Commit(); err != nil {
		return "", err
	}

	return orderId, nil
}
