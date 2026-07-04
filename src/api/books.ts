import { authClient } from './auth';

export interface PagedList<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: T[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BookEditionResponse {
  id: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  price: number;
  oldPrice: number | null;
  priceDisplay: string;
  oldPriceDisplay: string | null;
  stockQuantity: number;
  editionNumber: number;
  thumbnailUrl: string;
  filePathPdf: string | null;
  filePathPdfUrl: string | null;
  coverType: string;
  pageCount: number | null;
  publicationYear: number | null;
  dimensions: string | null;
  language: string | null;
  publisherName: string | null;
  soldCount?: number;
  ratingsCount?: number;
  rating?: number;
  authorName?: string;
  introduce?: string;
  description?: string;
  badges?: { text: string; textColor: string; bgColor: string; shape?: string }[];
}

export interface BookResponse {
  id: string;
  title: string;
  introduce: string;
  thumbnailUrl: string;
  badgeText: string | null;
  badgeTextColor: string | null;
  badgeBgColor: string | null;
  minPrice: number | null;
  priceDisplay: string;
  wasPriceDisplay: string | null;
  authors: string[];
  otherVersions?: BookEditionResponse[];
}

export const getBooksApi = (params: {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  categorySlug?: string;
  sortBy?: string;
  sortDirection?: string;
  minPrice?: number;
  maxPrice?: number;
  coverType?: string;
  authorName?: string;
}) => {
  return authClient.get<any>('/public/books', { params });
};
