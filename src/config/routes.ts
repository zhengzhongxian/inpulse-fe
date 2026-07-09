export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  BOOK_DETAIL: '/book/:id',
  ORDER_DETAIL: '/order/:orderId',
  BOOKS: '/books',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REGISTER_GOOGLE: '/register-google',
  CART: '/cart',
  CHECKOUT_RESULT: '/checkout/result',
} as const;

export const buildBookDetailPath = (id: string) => `/book/${id}`;
export const buildOrderDetailPath = (orderId: string) => `/order/${orderId}`;
