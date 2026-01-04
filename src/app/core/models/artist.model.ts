export interface Artist {
  id: number;
  name: string;
  logo: string;
}

export interface ArtistDetail extends Artist {
  genre: string;
  country: string;
}
