import { authClient } from './auth';

export interface GhnProvinceResponse {
  provinceId: number;
  provinceName: string;
  provinceCode: string;
}

export interface GhnDistrictResponse {
  districtId: number;
  provinceId: number;
  districtName: string;
  districtCode: string;
  supportType: number;
}

export interface GhnWardResponse {
  wardCode: string;
  districtId: number;
  wardName: string;
}

export const getProvincesApi = () => {
  return authClient.get<any>('/public/address/provinces');
};

export const getDistrictsApi = (provinceId: number) => {
  return authClient.get<any>(`/public/address/districts?provinceId=${provinceId}`);
};

export const getWardsApi = (districtId: number) => {
  return authClient.get<any>(`/public/address/wards?districtId=${districtId}`);
};
