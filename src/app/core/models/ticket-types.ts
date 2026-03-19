export interface TicketType {
  id: number;
  name: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}

export interface TicketTypeCreateDTO {
  name: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}

export interface CampingType {
  id: number;
  name: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}

export interface CampingTypeCreateDTO {
  name: string;
  price: number;
  stockTotal: number;
  stockAvailable: number;
}
