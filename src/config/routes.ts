export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  BOOK_DETAIL: '/book/:id',
  BOOKS: '/books',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REGISTER_GOOGLE: '/register-google',
  CART: '/cart',
} as const;

export const buildBookDetailPath = (id: string) => `/book/${id}`;
