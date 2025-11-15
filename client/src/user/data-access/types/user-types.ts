export interface AuthResponse {
  AccessToken: string;
  RefreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface BaseResponse {
  message: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserInfoResponse {
  name: string;
  surname: string;
  lastname: string;
  country: string;
  city: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
}

export interface UpdateUserInfoResponse {
  name?: string;
  surname?: string;
  lastname?: string;
  country?: string;
  city?: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
}

export type serviceClasses = "business" | "econom" | "comfort";

export interface OrderPriceResponse {
  price: number;
}

export interface CreateOrderRequest {
  city: string;
  start_trip_street: string;
  start_trip_house: string;
  start_trip_build: string;
  destination_street: string;
  destination_house: string;
  destination_build: string;
  service_category: serviceClasses;
  price: number;
  options?: {
    child?: boolean;
    pet?: boolean;
  };
}

export interface OrdersListResponse {
  id: string;
  city: string;
  start_trip_street: string;
  start_trip_house: string;
  start_trip_build: string;
  destination_street: string;
  destination_house: string;
  destination_build: string;
  service_category: serviceClasses;
  status: string;
  price: string;
  driver_name: string;
  Car?: CarModelResponse | null;
  options?: {
    child?: boolean;
    pet?: boolean;
  };
}

export interface CarModelResponse {
  brand: string;
  model: string;
  number: string;
}

export interface CreateTicketRequest {
  issue: string;
  details: string;
  order_id: string;
  status: string;
  solution: string;
}
