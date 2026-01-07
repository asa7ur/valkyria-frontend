import {Performance} from './performance';

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
  officialUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  tidalUrl?: string;
  spotifyUrl?: string;
  images: ArtistImage[];
  performances?: Performance[];
}
