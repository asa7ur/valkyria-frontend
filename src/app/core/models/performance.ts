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
  {label: $localize`:@@lineup.day.all:TODOS`, date: 'ALL'},
  {label: $localize`:@@lineup.day.wed13:MIÉ 13`, date: '2025-08-13'},
  {label: $localize`:@@lineup.day.thu14:JUE 14`, date: '2025-08-14'},
  {label: $localize`:@@lineup.day.fri15:VIE 15`, date: '2025-08-15'},
  {label: $localize`:@@lineup.day.sat16:SÁB 16`, date: '2025-08-16'}
];
