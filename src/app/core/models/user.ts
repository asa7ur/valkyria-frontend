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

// El administrador crea un usuario. El backend lo crea activo y con el rol USER
export interface UserCreate {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  phone: string;
  password: string;
  confirmPassword: string;
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
