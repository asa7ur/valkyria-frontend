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
  {label: $localize`:@@lineup.day.wed5:MIÉ 5`, date: '2026-08-05'},
  {label: $localize`:@@lineup.day.thu6:JUE 6`, date: '2026-08-06'},
  {label: $localize`:@@lineup.day.fri7:VIE 7`, date: '2026-08-07'},
  {label: $localize`:@@lineup.day.sat8:SÁB 8`, date: '2026-08-08'}
];
