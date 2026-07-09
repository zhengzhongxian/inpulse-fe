import { authClient } from './auth';

export interface CalculateShippingFeeRequest {
  toDistrictId: number;
  toWardCode: string;
  items: { editionId: string; quantity: number }[];
}

export interface CalculateShippingFeeResponse {
  total: number;
  serviceFee: number;
  insuranceFee: number;
  couponValue: number;
  codFailedFee: number;
}

export interface CreateOrderRequest {
  paymentMethod: 'COD' | 'PAYOS';
  items: { editionId: string; quantity: number }[];
  source?: string;
  // Saved address selection
  addressId?: string;
  // Or new address creation details
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  streetAddress?: string;
  recipientPhone?: string;
  receiverName?: string;
  addressLabel?: string;
  cartItemIds?: string[];
}

export interface CreateOrderResponse {
  orderId: string;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  checkoutUrl: string | null;
  qrCode?: string | null;
  message: string;
}

export interface OrderSummaryResponse {
  orderId: string;
  orderCode: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderFeeDisplay: string;
  shippingFeeDisplay: string;
  totalDisplay: string;
  totalItems: number;
  firstItemTitle: string;
  firstItemThumbnail: string;
  createdAt: string;
}

export interface OrderItemDetailResponse {
  editionId: string;
  bookTitle: string;
  authorName: string;
  thumbnailUrl: string;
  quantity: number;
  priceDisplay: string;
  subtotalDisplay: string;
}

export interface OrderDetailResponse {
  orderId: string;
  userId: string;
  orderCode: string;
  ghnOrderCode: string | null;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  receiverName: string;
  recipientPhone: string;
  shippingAddress: string;
  addressLabel: string;
  orderFeeDisplay: string;
  shippingFeeDisplay: string;
  totalDisplay: string;
  items: OrderItemDetailResponse[];
  createdAt: string;
}

export const calculateShippingFeeApi = (data: CalculateShippingFeeRequest) => {
  return authClient.post<any>('/orders/shipping-fee', data);
};

export const createOrderApi = (data: CreateOrderRequest) => {
  return authClient.post<any>('/orders', data);
};

export const getOrderDetailApi = (orderId: string) => {
  return authClient.get<any>(`/orders/${orderId}`);
};

export const getMyOrdersApi = (page: number = 1, size: number = 10) => {
  return authClient.get<any>(`/orders?page=${page}&size=${size}`);
};

export const mockPaymentApi = (orderCode: string) => {
  return authClient.post<any>(`/public/webhooks/mock?orderCode=${orderCode}`);
};
