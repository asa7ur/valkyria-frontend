export interface ResponseDTO<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
  filter?: any;
}
