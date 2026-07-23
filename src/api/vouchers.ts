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

export interface PublicVoucherResponse {
  voucherId: string;
  startDate: string;
  endDate: string;
  voucherCode: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minOrderValue: string;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  coinCost: number;
  targetType: 'ALL' | 'CATEGORY' | 'BOOK' | 'EDITION';
}

export interface VoucherTargetItemResponse {
  id: string;
  name: string;
}

export interface VoucherDetailResponse {
  voucherId: string;
  startDate: string;
  endDate: string;
  voucherCode: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minOrderValue: string;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  isActive: boolean;
  coinCost: number;
  targetType: 'ALL' | 'CATEGORY' | 'BOOK' | 'EDITION';
  createdAt: string;
  targetItems: VoucherTargetItemResponse[];
}

export interface VoucherListParams {
  page?: number;
  size?: number;
}

export interface SuitableVoucherListParams extends VoucherListParams {
  suitableOnly?: boolean;
  discountType?: string;
  minDiscount?: number;
  maxDiscount?: number;
  minMinOrder?: number;
  maxMinOrder?: number;
}

export const getPublicVouchersApi = (params: SuitableVoucherListParams) => {
  return authClient.get<any>('/vouchers', { params });
};

export const getPublicVoucherDetailApi = (voucherId: string) => {
  return authClient.get<any>(`/vouchers/${voucherId}`);
};

export const exchangeVoucherApi = (voucherId: string) => {
  return authClient.post<any>(`/vouchers/${voucherId}/exchange`);
};

export interface ExchangedVoucherListParams {
  page?: number;
  size?: number;
  status?: 'UNUSED' | 'USED' | 'EXPIRED';
  activeOnly?: boolean;
}

export const getMyVouchersApi = (params: ExchangedVoucherListParams) => {
  return authClient.get<any>('/vouchers/my-vouchers', { params });
};

export interface CheckoutEligibleVoucherResponse {
  userVoucherId: string;
  status: 'UNUSED' | 'USED';
  voucher: PublicVoucherResponse;
  eligible: boolean;
  reason: string | null;
  calculatedDiscount: number;
}

export interface CartItemRequest {
  editionId: string;
  quantity: number;
}

export const checkVoucherEligibilityApi = (items: CartItemRequest[]) => {
  return authClient.post<any>('/vouchers/checkout-eligibility', items);
};

