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

export interface DriverLicense {
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
}

export interface CreateDriverRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone_number: string;
  driver_license: DriverLicense;
}

export interface TicketResponse {
  id: string;
  issue: string;
  details: string;
  order_id: string;
  claiment_driver: boolean;
  stuff_id: {
    String: string;
    Valid: boolean;
  };
  status: string;
  solution: string;
}

export interface UpdateTicketRequest {
  status?: "open" | "in_progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "critical";
  description?: string;
}
