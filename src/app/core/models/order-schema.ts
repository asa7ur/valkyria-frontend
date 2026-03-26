import {Ticket, TicketCreateDTO} from './ticket';
import {Camping, CampingCreateDTO} from './camping';

export enum DocumentType {
  DNI = 'DNI',
  NIE = 'NIE',
  PASSPORT = 'PASSPORT'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface OrderCreateDTO {
  tickets: TicketCreateDTO[];
  campings: CampingCreateDTO[];
  guestEmail?: string;
}

export interface OrderDTO {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: OrderStatus;
  guestEmail?: string;
  tickets: Ticket[];
  campings: Camping[];
}
