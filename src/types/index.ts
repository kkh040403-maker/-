export interface PhotoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
  creationDate: string;
  camera?: string;
  lens?: string;
  archiveCode?: string;
  isFeatured?: boolean;
  order?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isSample?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  creationDate: string;
  duration?: string;
  resolution?: string;
  client?: string;
  archiveCode?: string;
  isFeatured?: boolean;
  order?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isSample?: boolean;
}

export interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  disciplines: string[];
  software: string[];
  exhibitions: {
    year: string;
    title: string;
    roleOrPlace: string;
  }[];
  socialLinks?: {
    instagram?: string;
    vimeo?: string;
    youtube?: string;
    github?: string;
  };
  updatedAt?: string;
}

export type PageTab = 'HOME' | 'PHOTO' | 'VIDEO' | 'ABOUT' | 'ADMIN';
