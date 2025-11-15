export interface AuthResponse {
  AccessToken: string;
  RefreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BaseResponse {
  message: string;
}

export interface DriverInfoResponse {
  name: string;
  surname: string;
  lastname: string;
  email: string;
  phone_number: string;
  driver_license: {
    name: string;
    surname: string;
    lastname: string;
    series: string;
    doc_number: string;
    date_of_birth: string;
    place_of_birth: string;
    date_of_issue: string;
    valid_until: string;
    residence: string;
    issued_unit: string;
    license_category: string;
  };
}

export interface UpdateDriverInfoResponse {
  name?: string;
  surname?: string;
  lastname?: string;
  phone_number?: string;
  driver_license?: {
    name?: string;
    surname?: string;
    lastname?: string;
    series?: string;
    doc_number?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    date_of_issue?: string;
    valid_until?: string;
    residence?: string;
    issued_unit?: string;
    license_category?: string;
  };
}

export interface CarInfo {
  id?: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  license_plate: string;
  is_active?: boolean;
}

export interface DriverOrderResponse {
  id: string;
  city: string;
  start_trip_street: string;
  start_trip_house: string;
  start_trip_build: string;
  destination_street: string;
  destination_house: string;
  destination_build: string;
  service_category: string;
  status: string;
  price: number;
  options?: {
    child?: boolean;
    pet?: boolean;
  };
  created_at?: string;
}

export interface ShiftInfo {
  id: string;
  start_time: string;
  end_time: string | null;
  status: "active" | "ended";
  total_orders?: number;
  total_earnings?: number;
}

export interface StartShiftResponse {
  shift_id: string;
  message: string;
}

export interface EndShiftResponse {
  shift_id: string;
  total_orders: number;
  total_earnings: number;
  message: string;
}

