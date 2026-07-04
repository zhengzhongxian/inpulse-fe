import { createContext, useContext, useState, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import type { UserSession } from '../models/UserSession';
import { logoutApi } from '../api/auth';
import { useNavigation } from './NavigationContext';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  userCoins: number;
  setUserCoins: (coins: number) => void;
  completeLoginFlow: (result: any, username: string, userEmail?: string) => void;
  logoutUser: () => Promise<void>;
  handleUpdateUserCoins: (cost: number) => void;
  handleUpdateUserProfile: (updated: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setCurrentPage } = useNavigation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('inkpulse_access_token') !== null;
  });
  const [user, setUser] = useState<UserSession | null>(() => {
    const token = localStorage.getItem('inkpulse_access_token');
    if (token) {
      const claims = parseJwt(token);
      if (claims) {
        return {
          userId: claims.sub || '',
          username: claims.username || 'user',
          email: '',
          displayMode: 'LIGHT',
          choiceLanguage: 'VI',
          deviceTrusted: true,
          mfaEnabled: false
        };
      }
    }
    return null;
  });
  const [userCoins, setUserCoins] = useState<number>(100);

  const completeLoginFlow = (result: any, username: string, userEmail?: string) => {
    const claims = parseJwt(result.accessToken);
    const userId = claims?.sub || '';
    const tokenUsername = claims?.username || username || 'user';

    const userSession: UserSession = {
      userId,
      username: tokenUsername,
      email: userEmail || result.maskedEmail || (tokenUsername.includes('@') ? tokenUsername : `${tokenUsername}@gmail.com`),
      displayMode: 'LIGHT',
      choiceLanguage: 'VI',
      deviceTrusted: true,
      mfaEnabled: false
    };

    localStorage.setItem('inkpulse_access_token', result.accessToken);
    localStorage.setItem('inkpulse_refresh_token', result.refreshToken);

    setUser(userSession);
    setIsLoggedIn(true);
  };

  const logoutUser = async () => {
    const rToken = localStorage.getItem('inkpulse_refresh_token');
    if (rToken) {
      try {
        await logoutApi(rToken);
      } catch (e) {
        // Silently logout locally
      }
    }

    localStorage.removeItem('inkpulse_access_token');
    localStorage.removeItem('inkpulse_refresh_token');

    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
    toast.success('Đăng xuất thành công!');
  };

  const handleUpdateUserCoins = (cost: number) => {
    setUserCoins((prev) => Math.max(0, prev - cost));
  };

  const handleUpdateUserProfile = (updated: Partial<UserSession>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updated };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        userCoins,
        setUserCoins,
        completeLoginFlow,
        logoutUser,
        handleUpdateUserCoins,
        handleUpdateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
