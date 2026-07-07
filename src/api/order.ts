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
  message: string;
}

export interface OrderDetailResponse {
  id: string;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingFee: number;
  orderFee: number;
  totalAmount: number;
  receiverName: string;
  recipientPhone: string;
  streetAddress: string;
  provinceName: string;
  districtName: string;
  wardName: string;
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

export const mockPaymentApi = (orderCode: string) => {
  return authClient.post<any>(`/public/webhooks/mock?orderCode=${orderCode}`);
};
