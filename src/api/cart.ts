import { authClient } from './auth';

export interface CartItemResponse {
  id: string;
  editionId: string;
  bookTitle: string;
  authorName: string;
  thumbnailUrl: string;
  price: number;
  priceDisplay: string;
  quantity: number;
  stockQuantity: number;
  stockSufficient: boolean;
  editionNumber?: number;
  coverType?: string;
  isbn?: string;
  isFlashSale?: boolean;
  flashSaleItemId?: string;
}

export const addToCartApi = (editionId: string, quantity: number = 1) => {
  return authClient.post('/cart/items', { editionId, quantity });
};

export const getMyCartApi = (pageNumber: number = 1, pageSize: number = 10) => {
  return authClient.get(`/cart`, {
    params: { pageNumber, pageSize },
  });
};

export const updateCartItemApi = (itemId: string, newQuantity: number) => {
  return authClient.put(`/cart/items/${itemId}`, { newQuantity });
};

export const removeCartItemApi = (itemId: string) => {
  return authClient.delete(`/cart/items/${itemId}`);
};
