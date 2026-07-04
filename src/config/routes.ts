export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  BOOK_DETAIL: '/book/:id',
  BOOKS: '/books',
} as const;

export const buildBookDetailPath = (id: string) => `/book/${id}`;
