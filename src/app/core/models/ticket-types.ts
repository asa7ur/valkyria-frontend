export interface TicketType {
  id: number;
  name: string;
  nameEn?: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}

export interface TicketTypeCreateDTO {
  name: string;
  nameEn?: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}

export interface CampingType {
  id: number;
  name: string;
  nameEn?: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}

export interface CampingTypeCreateDTO {
  name: string;
  nameEn?: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}
