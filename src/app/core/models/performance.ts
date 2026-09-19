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
  label: string;      // Clave de traducción (Ej: "lineup.days.thu")
  date: string;       // "2027-08-05"
}

export const FESTIVAL_DAYS: DayOption[] = [
  {
    label: 'lineup.days.all',
    date: 'ALL'
  },
  {
    label: 'lineup.days.thu',
    date: '2027-08-05'
  },
  {
    label: 'lineup.days.fri',
    date: '2027-08-06'
  },
  {
    label: 'lineup.days.sat',
    date: '2027-08-07'
  }
];
