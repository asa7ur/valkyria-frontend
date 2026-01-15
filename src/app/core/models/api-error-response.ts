export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  key: string;
  path: string;
  errors?: { [key: string]: string };
}
