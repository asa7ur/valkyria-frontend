export enum DocumentType {
  DNI = 'DNI',
  NIE = 'NIE',
  PASSPORT = 'PASSPORT'
}

export interface TicketOrder {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  ticketTypeId: number;
}

export interface CampingOrder {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  campingTypeId: number;
}

export interface OrderRequest {
  tickets: TicketOrder[];
  campings: CampingOrder[];
}
