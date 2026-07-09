import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import type { UserSession } from '../models/UserSession';
import { logoutApi, logOutClient, getUserProfileApi, getCartCountApi, setAccessToken, refreshSession } from '../api/auth';
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

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Silent refresh session initialization on app mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const token = await refreshSession();
        if (token) {
          const claims = parseJwt(token);
          if (claims) {
            setUser({
              userId: claims.sub || '',
              username: claims.username || 'user',
              email: '',
              displayMode: 'LIGHT',
              choiceLanguage: 'VI',
              deviceTrusted: true,
              mfaEnabled: false,
              coinBalance: 0,
            });
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error('Silent refresh failed on mount:', err);
      } finally {
        setInitializing(false);
      }
    };
    initSession();
  }, []);

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
                  isSocialAccount: (profileData.isSocialAccount ?? profileData.socialAccount) ?? false,
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

    setAccessToken(result.accessToken);

    setUser(userSession);
    setIsLoggedIn(true);
  };

  const logoutUser = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Silently logout locally
    }

    logOutClient();
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

  if (initializing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#ffffff', position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/favicon.svg" alt="Loading..." style={{ width: '96px', height: '96px', animation: 'pulse-fav 1.5s infinite ease-in-out' }} />
          <style>{`
            @keyframes pulse-fav {
              0% { transform: scale(0.85); opacity: 0.6; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(0.85); opacity: 0.6; }
            }
          `}</style>
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', opacity: 0.8, height: '48px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="InkPulse Logo" style={{ height: '100px', maxWidth: '220px', objectFit: 'contain', marginTop: '-26px', marginBottom: '-30px' }} />
        </div>
      </div>
    );
  }

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
