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
  label: string;      // Versión corta para el menú (Ej: "MIÉ 5")
  fullLabel: string;  // Versión larga para el título (Ej: "MIÉRCOLES 5")
  date: string;       // "2026-08-05"
}

export const FESTIVAL_DAYS: DayOption[] = [
  {
    label: $localize`:@@lineup.day.all:TODOS`,
    fullLabel: $localize`:@@lineup.day.all.full:TODOS LOS DÍAS`,
    date: 'ALL'
  },
  {
    label: $localize`:@@lineup.day.wed5:MIÉ 5`,
    fullLabel: $localize`:@@lineup.day.wed5.full:MIÉRCOLES 5`,
    date: '2026-08-05'
  },
  {
    label: $localize`:@@lineup.day.thu6:JUE 6`,
    fullLabel: $localize`:@@lineup.day.thu6.full:JUEVES 6`,
    date: '2026-08-06'
  },
  {
    label: $localize`:@@lineup.day.fri7:VIE 7`,
    fullLabel: $localize`:@@lineup.day.fri7.full:VIERNES 7`,
    date: '2026-08-07'
  },
  {
    label: $localize`:@@lineup.day.sat8:SÁB 8`,
    fullLabel: $localize`:@@lineup.day.sat8.full:SÁBADO 8`,
    date: '2026-08-08'
  }
];
