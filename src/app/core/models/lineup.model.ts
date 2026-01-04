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
