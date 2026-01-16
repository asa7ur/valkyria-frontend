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
