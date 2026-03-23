export interface FilterDTO {
  page: number;
  itemsPerPage: number;
  search?: string;
  totalPages?: number;
  totalElements?: number;
}
