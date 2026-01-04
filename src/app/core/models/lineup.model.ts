export interface LineupArtist {
  id: number;
  name: string;
  logo: string;
  genre: string;
}

export interface Stage {
  id: number;
  name: string;
}

export interface Performance {
  id: number;
  startTime: string;
  endTime: string;
  artist: LineupArtist;
  stage: Stage;
}

// Interfaz para manejar la selección de días en la UI
export interface DayOption {
  label: string;      // Ej: "WED 8"
  date: string;       // Ej: "2026-07-08" (para filtrar)
}

export const FESTIVAL_DAYS: DayOption[] = [
  {label: 'ALL', date: 'ALL'},
  {label: 'WED 13', date: '2025-08-13'},
  {label: 'THU 14', date: '2025-08-14'},
  {label: 'FRI 15', date: '2025-08-15'},
  {label: 'SAT 16', date: '2025-08-16'}
];
