import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { MfaMethod } from '../models/MfaMethod';
import { useAuth } from './AuthContext';
import { useNavigation } from './NavigationContext';
import {
  loginApi,
  sendOtpApi,
  initPushApi,
  checkPushStatusApi,
  verifyMfaApi,
  simulateApprovePushApi,
} from '../api/auth';

interface LoginContextType {
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  loginLoading: boolean;
  setLoginLoading: (loading: boolean) => void;
  loginStage: 'form' | 'mfa_select' | 'mfa_otp' | 'mfa_totp' | 'mfa_push';
  setLoginStage: (stage: 'form' | 'mfa_select' | 'mfa_otp' | 'mfa_totp' | 'mfa_push') => void;
  enteredUsername: string;
  setEnteredUsername: (username: string) => void;

  deviceId: string;
  browserFingerprint: string;

  mfaSessionId: string;
  setMfaSessionId: (id: string) => void;
  supportedMethods: MfaMethod[];
  setSupportedMethods: (methods: MfaMethod[]) => void;
  mfaMaskedEmail: string;
  setMfaMaskedEmail: (email: string) => void;
  pushSelectedNum: number | null;
  setPushSelectedNum: (num: number | null) => void;
  pushApproved: boolean;
  setPushApproved: (approved: boolean) => void;

  handleLoginSubmit: (login: string, pass: string) => Promise<void>;
  selectMfaMethod: (methodType: string) => Promise<void>;
  handleOtpVerify: (code: string) => Promise<void>;
  handleTotpVerify: (code: string) => Promise<void>;
  simulatePushApprove: () => Promise<void>;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const { completeLoginFlow } = useAuth();
  const { currentPage, setCurrentPage } = useNavigation();

  // Login Form & Flow States
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginStage, setLoginStage] = useState<'form' | 'mfa_select' | 'mfa_otp' | 'mfa_totp' | 'mfa_push'>('form');
  const [enteredUsername, setEnteredUsername] = useState<string>('');

  // Simulated Client Device Footprint
  const [deviceId, setDeviceId] = useState<string>('');
  const [browserFingerprint, setBrowserFingerprint] = useState<string>('');

  // MFA verification states
  const [mfaSessionId, setMfaSessionId] = useState<string>('');
  const [supportedMethods, setSupportedMethods] = useState<MfaMethod[]>([]);
  const [mfaMaskedEmail, setMfaMaskedEmail] = useState<string>('');
  const [pushSelectedNum, setPushSelectedNum] = useState<number | null>(null);
  const [pushApproved, setPushApproved] = useState<boolean>(false);

  const pollingTimer = useRef<any>(null);

  // Generate mock device_id and fingerprint on mount
  useEffect(() => {
    let savedDeviceId = localStorage.getItem('inkpulse_device_id');
    if (!savedDeviceId) {
      savedDeviceId = 'dev_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('inkpulse_device_id', savedDeviceId);
    }
    setDeviceId(savedDeviceId);

    // Compute mock fingerprint
    const fp = 'fp_chrome_win11_' + Math.abs(savedDeviceId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0));
    setBrowserFingerprint(fp);

    return () => {
      if (pollingTimer.current) {
        clearInterval(pollingTimer.current);
      }
    };
  }, []);

  // Poll state parameters from backend occasionally to check for MFA approval
  useEffect(() => {
    if (currentPage !== 'login' || !mfaSessionId) return;

    let isActive = true;
    const fetchStatusInterval = setInterval(async () => {
      try {
        const res = await checkPushStatusApi(mfaSessionId);
        if (isActive && res.data.success && res.data.data) {
          const status = res.data.data.status;
          const approved = res.data.data.approved;
          if (status === 'APPROVED' || approved) {
            clearInterval(fetchStatusInterval);
            setPushApproved(true);
            
            // Auto complete MFA login with a 1-second spinning transition
            setTimeout(async () => {
              setLoginLoading(true);
              try {
                const verifyRes = await verifyMfaApi({
                  mfaSessionId: mfaSessionId,
                  code: "APPROVED",
                  deviceId: deviceId,
                  browserFingerprint: browserFingerprint
                });
                setLoginLoading(false);
                if (verifyRes.data.success) {
                  completeLoginFlow(verifyRes.data.data, enteredUsername);
                  setCurrentPage('home');
                  // Reset states
                  setLoginStage('form');
                  setMfaSessionId('');
                  setSupportedMethods([]);
                } else {
                  setPushApproved(false);
                  setLoginError(verifyRes.data.message || 'Xác thực MFA thất bại.');
                }
              } catch (err: any) {
                setLoginLoading(false);
                setPushApproved(false);
                const msg = err.response?.data?.message || 'Xác thực MFA thất bại.';
                setLoginError(msg);
              }
            }, 1000);
          } else if (status === 'EXPIRED' || status === 'REJECTED') {
            clearInterval(fetchStatusInterval);
            setPushApproved(false);
            setLoginLoading(false);
            setLoginError('Số xác nhận không chính xác hoặc phiên xác thực đã hết hạn.');
            setLoginStage('mfa_select');
            setMfaSessionId('');
            setSupportedMethods([]);
          }
        }
      } catch (e) {
        // Silently catch
      }
    }, 2000);

    return () => {
      isActive = false;
      clearInterval(fetchStatusInterval);
    };
  }, [currentPage, mfaSessionId, deviceId, browserFingerprint, enteredUsername, completeLoginFlow, setCurrentPage]);

  // Reset login/MFA states when navigating away from login page
  useEffect(() => {
    if (currentPage !== 'login') {
      setLoginStage('form');
      setMfaSessionId('');
      setSupportedMethods([]);
      setLoginError(null);
      setLoginLoading(false);
      setPushApproved(false);
      setPushSelectedNum(null);
    }
  }, [currentPage]);

  // Actual API Login Submit
  const handleLoginSubmit = async (login: string, pass: string) => {
    if (!login || !pass) {
      setLoginError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    setEnteredUsername(login);

    try {
      const response = await loginApi({
        login: login,
        password: pass,
        deviceId: deviceId,
        browserFingerprint: browserFingerprint,
        deviceName: 'Chrome / Windows',
        deviceType: 'DESKTOP'
      });

      setLoginLoading(false);
      const resData = response.data;

      if (resData.success) {
        const result = resData.data;
        if (result.mfaRequired) {
          setMfaSessionId(result.mfaSessionId);
          setSupportedMethods(result.supportedMethods || []);
          setMfaMaskedEmail(result.maskedEmail || '');
          setLoginStage('mfa_select');
        } else {
          completeLoginFlow(result, login);
          setCurrentPage('home');
          // Reset states
          setLoginStage('form');
          setMfaSessionId('');
          setSupportedMethods([]);
        }
      } else {
        setLoginError(resData.message || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      setLoginLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Không thể kết nối đến máy chủ xác thực.');
      }
    }
  };

  // MFA Selector handler
  const selectMfaMethod = async (methodType: string) => {
    setLoginError(null);
    if (methodType === 'EMAIL') {
      setLoginLoading(true);
      try {
        const res = await sendOtpApi(mfaSessionId, mfaMaskedEmail);
        setLoginLoading(false);
        const challengeCode = res.data.data;
        setPushSelectedNum(Number(challengeCode) || 42);
        setLoginStage('mfa_otp');
      } catch (err: any) {
        setLoginLoading(false);
        const msg = err.response?.data?.message || 'Không thể gửi mã OTP Email.';
        setLoginError(msg);
      }
    } else if (methodType === 'TOTP') {
      setLoginStage('mfa_totp');
    } else if (methodType === 'PUSH') {
      setLoginLoading(true);
      try {
        const res = await initPushApi(mfaSessionId);
        setLoginLoading(false);
        const challengeCode = res.data.data;
        setPushSelectedNum(Number(challengeCode) || 42);
        setPushApproved(false);
        setLoginStage('mfa_push');
      } catch (err: any) {
        setLoginLoading(false);
        const msg = err.response?.data?.message || 'Không thể khởi tạo Google Push.';
        setLoginError(msg);
      }
    }
  };

  // Verify OTP handler
  const handleOtpVerify = async (code: string) => {
    if (code.length < 6) return;

    setLoginLoading(true);
    try {
      const verifyRes = await verifyMfaApi({
        mfaSessionId: mfaSessionId,
        code: code,
        deviceId: deviceId,
        browserFingerprint: browserFingerprint
      });
      setLoginLoading(false);
      if (verifyRes.data.success) {
        completeLoginFlow(verifyRes.data.data, 'admin');
        setCurrentPage('home');
        // Reset states
        setLoginStage('form');
        setMfaSessionId('');
        setSupportedMethods([]);
      } else {
        setLoginError(verifyRes.data.message || 'Mã OTP không chính xác.');
      }
    } catch (err: any) {
      setLoginLoading(false);
      const msg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
      setLoginError(msg);
    }
  };

  // Verify TOTP handler
  const handleTotpVerify = async (code: string) => {
    if (code.length < 6) return;

    setLoginLoading(true);
    try {
      const verifyRes = await verifyMfaApi({
        mfaSessionId: mfaSessionId,
        code: code,
        deviceId: deviceId,
        browserFingerprint: browserFingerprint
      });
      setLoginLoading(false);
      if (verifyRes.data.success) {
        completeLoginFlow(verifyRes.data.data, enteredUsername);
        setCurrentPage('home');
        // Reset states
        setLoginStage('form');
        setMfaSessionId('');
        setSupportedMethods([]);
      } else {
        setLoginError(verifyRes.data.message || 'Mã Google Authenticator không chính xác.');
      }
    } catch (err: any) {
      setLoginLoading(false);
      const msg = err.response?.data?.message || 'Mã xác thực không chính xác hoặc đã hết hạn.';
      setLoginError(msg);
    }
  };

  // Simulated push approval click (triggers BE approval)
  const simulatePushApprove = async () => {
    if (!mfaSessionId) return;
    try {
      await simulateApprovePushApi(mfaSessionId);
    } catch (err: any) {
      setLoginError('Không thể giả lập phê duyệt MFA trên điện thoại.');
    }
  };

  return (
    <LoginContext.Provider
      value={{
        loginError,
        setLoginError,
        loginLoading,
        setLoginLoading,
        loginStage,
        setLoginStage,
        enteredUsername,
        setEnteredUsername,
        deviceId,
        browserFingerprint,
        mfaSessionId,
        setMfaSessionId,
        supportedMethods,
        setSupportedMethods,
        mfaMaskedEmail,
        setMfaMaskedEmail,
        pushSelectedNum,
        setPushSelectedNum,
        pushApproved,
        setPushApproved,
        handleLoginSubmit,
        selectMfaMethod,
        handleOtpVerify,
        handleTotpVerify,
        simulatePushApprove,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};
