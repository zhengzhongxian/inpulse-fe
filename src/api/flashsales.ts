import { authClient } from './auth';

export interface FlashSaleItemResponse {
  flashSaleItemId: string;
  flashSaleId: string;
  name: string;
  bookEditionId: string;
  bookTitle: string;
  editionTitle: string; // isbn
  thumbnailUrl: string;
  originalPrice: number;
  discountAmount: number;
  flashSalePrice: number;
  flashSaleStock: number;
  soldCount: number;
  startDate: string;
  endDate: string;
}

export const getActiveFlashSalesApi = () => {
  return authClient.get<any>('/flash-sales/active');
};
