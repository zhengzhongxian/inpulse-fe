import { createContext, useContext, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Book } from '../models/Book';
import { ROUTES, buildBookDetailPath } from '../config/routes';

type PageType = 'home' | 'login' | 'profile' | 'book-detail' | 'register';

interface NavigationContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  handlePageNavigation: (page: PageType, book?: Book | null) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  selectedDetailBook: Book | null;
  setSelectedDetailBook: (book: Book | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedDetailBook, setSelectedDetailBook] = useState<Book | null>(null);

  const getPageFromPath = (pathname: string): PageType => {
    if (pathname === ROUTES.LOGIN) return 'login';
    if (pathname === ROUTES.REGISTER) return 'register';
    if (pathname === ROUTES.PROFILE) return 'profile';
    if (pathname.startsWith('/book/')) return 'book-detail';
    return 'home';
  };

  const currentPage = getPageFromPath(location.pathname);

  const handlePageNavigation = (page: PageType, book?: Book | null) => {
    if (page === 'home') {
      navigate(ROUTES.HOME);
    } else if (page === 'login') {
      navigate(ROUTES.LOGIN);
    } else if (page === 'register') {
      navigate(ROUTES.REGISTER);
    } else if (page === 'profile') {
      navigate(ROUTES.PROFILE);
    } else if (page === 'book-detail') {
      const target = book || selectedDetailBook;
      if (target) {
        navigate(buildBookDetailPath(target.id));
      } else {
        navigate(ROUTES.HOME);
      }
    }

    if (page !== 'book-detail') setSelectedDetailBook(null);
    setSelectedBook(null);
  };

  const setCurrentPage = (page: PageType) => {
    handlePageNavigation(page);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        handlePageNavigation,
        selectedBook,
        setSelectedBook,
        selectedDetailBook,
        setSelectedDetailBook,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
