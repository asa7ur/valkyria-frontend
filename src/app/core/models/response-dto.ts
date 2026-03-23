export interface ResponseDTO<T> {
  timestamp: string;
  status: number;
  success: boolean;
  message: string;
  data: T;
  filter?: any;
}
