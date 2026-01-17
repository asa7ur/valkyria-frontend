export interface Ticket {
  id: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string; // ISO Date string
  qrCode?: string;
  status: string;
  ticketTypeName: string;
}

export interface TicketCreateDTO {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  ticketTypeId: number;
}
