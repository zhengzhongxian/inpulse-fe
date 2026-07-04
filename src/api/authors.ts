import { authClient } from './auth';

export interface AuthorResponse {
  id: string;
  name: string;
  biography: string | null;
  avatar: string | null;
}

export const getAuthorsApi = (params?: { pageNumber?: number; pageSize?: number; searchKeyword?: string }) => {
  return authClient.get<any>('/public/authors', { params });
};
