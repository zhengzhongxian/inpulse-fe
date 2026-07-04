import { authClient } from './auth';

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export const getCategoriesApi = () => {
  return authClient.get<any>('/public/categories');
};
