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

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
