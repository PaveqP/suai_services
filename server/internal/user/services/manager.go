package user_services

import (
	"database/sql"
	"math/rand"
	"strconv"
	user_models "taxi/internal/user/models"
	user_repositories "taxi/internal/user/repositories"
	"time"
)

type ManagerService struct {
	r *user_repositories.UserRepository
}

func NewManagerService(r *user_repositories.UserRepository) *ManagerService {
	return &ManagerService{r}
}

func (ms *ManagerService) GetUserInfo(userId string) (*user_models.UserInfoResponse, error) {
	userInfo, err := ms.r.GetUserInfo(userId)
	if err != nil {
		return nil, err
	}

	response := &user_models.UserInfoResponse{
		Name:        userInfo.Name,
		Surname:     userInfo.Surname,
		Lastname:    getUserInfoString(userInfo.Lastname),
		Country:     getUserInfoString(userInfo.Country),
		City:        getUserInfoString(userInfo.City),
		DateOfBirth: getUserInfoString(userInfo.DateOfBirth),
		Email:       userInfo.Email,
		PhoneNumber: userInfo.PhoneNumber,
	}

	return response, nil
}

func (ms *ManagerService) UpdateUserInfo(userID string, req *user_models.UpdateUserInfoRequest) error {
	updateData := ms.buildUpdateModel(req)

	return ms.r.Manager.UpdateUserInfo(userID, updateData)
}

func (ms *ManagerService) CreateOrder(userId string, req *user_models.CreateOrderRequest) (string, error) {
	orderID, err := ms.r.Manager.CreateOrder(userId, req)
	if err != nil {
		return "", err
	}

	return orderID, nil
}

func (ms *ManagerService) GetOrderPrice(filters user_models.GetOrderPriceRequest) (string, error) {

	rand.Seed(time.Now().UnixNano())

	orderPrice := len(filters.StartTripStreet) + len(filters.StartTripHouse) + len(filters.DestinationStreet) + len(filters.DestinationHouse)
	if filters.ServiceCategory == "econom" {
		orderPrice += 120
	}
	if filters.ServiceCategory == "comfort" {
		orderPrice += 320
	}
	if filters.ServiceCategory == "business" {
		orderPrice += 820
	}

	randomAddition := rand.Intn(201) + 100
	orderPrice += randomAddition

	return strconv.Itoa(orderPrice), nil
}

func (ms *ManagerService) GetUserOrders(userID string) (*[]user_models.OrderResponse, error) {
	orders, err := ms.r.Manager.GetUserOrders(userID)
	if err != nil {
		return nil, err
	}

	return orders, nil
}

func (ms *ManagerService) buildUpdateModel(req *user_models.UpdateUserInfoRequest) *user_models.UserInfo {
	userInfo := &user_models.UserInfo{}

	if req.Name != nil {
		userInfo.Name = *req.Name
	}
	if req.Surname != nil {
		userInfo.Surname = *req.Surname
	}
	if req.Lastname != nil {
		userInfo.Lastname = sql.NullString{
			String: *req.Lastname,
			Valid:  true,
		}
	} else {
		userInfo.Lastname = sql.NullString{Valid: false}
	}
	if req.Country != nil {
		userInfo.Country = sql.NullString{
			String: *req.Country,
			Valid:  true,
		}
	} else {
		userInfo.Country = sql.NullString{Valid: false}
	}
	if req.City != nil {
		userInfo.City = sql.NullString{
			String: *req.City,
			Valid:  true,
		}
	} else {
		userInfo.City = sql.NullString{Valid: false}
	}
	if req.DateOfBirth != nil {
		userInfo.DateOfBirth = sql.NullString{
			String: *req.DateOfBirth,
			Valid:  true,
		}
	} else {
		userInfo.DateOfBirth = sql.NullString{Valid: false}
	}
	if req.PhoneNumber != nil {
		userInfo.PhoneNumber = *req.PhoneNumber
	}

	return userInfo
}

func getUserInfoString(nullString sql.NullString) string {
	if nullString.Valid {
		return nullString.String
	}
	return ""
}
