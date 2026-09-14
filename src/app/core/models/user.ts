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

// El administrador fija una contraseña nueva sin conocer la actual
export interface AdminPasswordReset {
  newPassword: string;
  confirmPassword: string;
}
