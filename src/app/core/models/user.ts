export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  phone: string;
  roles: string[];
  enabled: boolean;
}

export interface UserRegistrationDTO {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  birthDate: string;
  phone: string;
}
