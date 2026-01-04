export interface ArtistImage {
  id: number;
  imageUrl: string;
}

export interface Artist {
  id: number;
  name: string;
  phone: string;
  email: string;
  genre: string;
  country: string;
  logo: string;
  description?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  instagramUrl?: string;
  images: ArtistImage[];
  performances?: any[];
}
