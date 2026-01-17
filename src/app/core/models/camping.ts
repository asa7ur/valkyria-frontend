export interface Camping {
  id: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string; // ISO Date string
  qrCode?: string;
  status: string;
  campingTypeName: string;
}

export interface CampingCreateDTO {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  campingTypeId: number;
}
