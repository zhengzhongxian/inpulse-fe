import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import type { UserSession } from '../models/UserSession';
import { logoutApi, getUserProfileApi, getCartCountApi } from '../api/auth';
import { useNavigation } from './NavigationContext';
import { decryptAes } from '../utils/crypto';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  userCoins: number;
  setUserCoins: (coins: number) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
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
          mfaEnabled: false,
          coinBalance: 0,
        };
      }
    }
    return null;
  });
  const [userCoins, setUserCoins] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  // Fetch profile and cart count when logged in (on mount or after login)
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchDynamicState = async () => {
      try {
        const [profileRes, cartRes] = await Promise.allSettled([
          getUserProfileApi(),
          getCartCountApi(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.data?.success) {
          const profileData = profileRes.value.data.data;
          const decryptedEmail = decryptAes(profileData.email, profileData.email);
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  email: decryptedEmail,
                  displayMode: profileData.displayMode ?? prev.displayMode,
                  choiceLanguage: profileData.choiceLanguage ?? prev.choiceLanguage,
                  mfaEnabled: profileData.mfaEnabled ?? prev.mfaEnabled,
                  coinBalance: profileData.coinBalance ?? 0,
                }
              : prev
          );
          setUserCoins(profileData.coinBalance ?? 0);
        }

        if (cartRes.status === 'fulfilled' && cartRes.value.data?.success) {
          setCartCount(cartRes.value.data.data ?? 0);
        }
      } catch (err) {
        // Silently fail — user sees last known state
      }
    };

    fetchDynamicState();
  }, [isLoggedIn]);

  const completeLoginFlow = (result: any, username: string, userEmail?: string) => {
    const claims = parseJwt(result.accessToken);
    const userId = claims?.sub || '';
    const tokenUsername = claims?.username || username || 'user';

    const userSession: UserSession = {
      userId,
      username: tokenUsername,
      email: userEmail || result.maskedEmail || '',
      displayMode: 'LIGHT',
      choiceLanguage: 'VI',
      deviceTrusted: true,
      mfaEnabled: false,
      coinBalance: 0,
    };

    localStorage.setItem('inkpulse_access_token', result.accessToken);
    localStorage.setItem('inkpulse_refresh_token', result.refreshToken);

    setUser(userSession);
    setIsLoggedIn(true);
    // useEffect above will auto-trigger fetchDynamicState after setIsLoggedIn(true)
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
    setUserCoins(0);
    setCartCount(0);
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
    if (updated.coinBalance !== undefined) {
      setUserCoins(updated.coinBalance);
    }
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
        cartCount,
        setCartCount,
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
