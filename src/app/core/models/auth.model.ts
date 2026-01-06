export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
}


export interface AuthResponse {
  token: string;
  username: string;
  role?: string;
}
