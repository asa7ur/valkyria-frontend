export interface ArtistImage {
  id: number;
  imageUrl: string;
}

export interface Artist {
  id: number;
  name: string;
  genre: string;
  country: string;
  logo: string;
  images: ArtistImage[];
}
