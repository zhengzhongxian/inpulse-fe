import api from './client';

export interface BannerEditionItem {
  editionId: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  price: string;
  oldPrice?: string;
  coverUrl?: string;
  displayOrder: number;
}

export interface BannerResponse {
  bannerId: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  iconUrl?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  editions: BannerEditionItem[];
}

export const getPublicBannersApi = async () => {
  return await api.get('/v1/banners/public');
};
