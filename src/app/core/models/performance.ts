export interface LineupArtist {
  id: number;
  name: string;
  logo: string;
  genre: string;
}

export interface Stage {
  id: number;
  name: string;
  nameEn?: string;
}

export interface Performance {
  id: number;
  startTime: string;
  endTime: string;
  artist: LineupArtist;
  stage: Stage;
}

export interface StructuredStage {
  name: string;
  nameEn?: string;
  performances: Performance[];
}

export interface StructuredDay {
  date: string;
  stages: StructuredStage[];
}

// Interfaz para manejar la selección de días en la UI
export interface DayOption {
  label: string;      // Clave de traducción (Ej: "lineup.days.thu_6")
  date: string;       // "2026-08-06"
}

export const FESTIVAL_DAYS: DayOption[] = [
  {
    label: 'lineup.days.all',
    date: 'ALL'
  },
  {
    label: 'lineup.days.thu_6',
    date: '2026-08-06'
  },
  {
    label: 'lineup.days.fri_7',
    date: '2026-08-07'
  },
  {
    label: 'lineup.days.sat_8',
    date: '2026-08-08'
  }
];
