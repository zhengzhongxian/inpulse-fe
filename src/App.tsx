import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { Book, UserSession, MfaMethod } from './types';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BookModal from './components/BookModal/BookModal';
import DevSandbox from './components/DevSandbox/DevSandbox';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import BookDetail from './pages/BookDetail/BookDetail';
import {
  loginApi,
  sendOtpApi,
  initPushApi,
  checkPushStatusApi,
  verifyMfaApi,
  simulateApprovePushApi,
  logoutApi,
} from './api/auth';

function App() {
  // Navigation & View States
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'profile' | 'book-detail'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedDetailBook, setSelectedDetailBook] = useState<Book | null>(null);
  const [userDropdownActive, setUserDropdownActive] = useState<boolean>(false);
  const [userCoins, setUserCoins] = useState<number>(100);

  // Login Form & Flow States
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginStage, setLoginStage] = useState<'form' | 'mfa_select' | 'mfa_otp' | 'mfa_totp' | 'mfa_push'>('form');

  // Simulated Client Device Footprint
  const [deviceId, setDeviceId] = useState<string>('');
  const [browserFingerprint, setBrowserFingerprint] = useState<string>('');

  // MFA verification states
  const [mfaSessionId, setMfaSessionId] = useState<string>('');
  const [supportedMethods, setSupportedMethods] = useState<MfaMethod[]>([]);
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

    // Check if tokens already exist in localStorage
    const savedToken = localStorage.getItem('inkpulse_access_token');
    const savedUser = localStorage.getItem('inkpulse_user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    return () => {
      if (pollingTimer.current) {
        clearInterval(pollingTimer.current);
      }
    };
  }, []);

  // Poll state parameters from backend occasionally to show in sandbox debugger
  useEffect(() => {
    if (currentPage !== 'login') return;

    const fetchStatusInterval = setInterval(async () => {
      if (!mfaSessionId) return;
      try {
        const res = await checkPushStatusApi(mfaSessionId);
        if (res.data.success && res.data.data) {
          const status = res.data.data.status;
          if (status === 'APPROVED') {
            setPushApproved(true);
          }
        }
      } catch (e) {
        // Silently catch
      }
    }, 2000);

    return () => clearInterval(fetchStatusInterval);
  }, [currentPage, mfaSessionId]);

  // Automatically clear loginError after 5 seconds to dismiss the Toast
  useEffect(() => {
    if (loginError) {
      toast.error(loginError);
      setLoginError(null);
    }
  }, [loginError]);

  // Actual API Login Submit
  const handleLoginSubmit = async (login: string, pass: string) => {
    if (!login || !pass) {
      setLoginError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

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
          setLoginStage('mfa_select');
        } else {
          completeLoginFlow(result, login);
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
        const emailToUse = 'admin@inkpulse.com';
        await sendOtpApi(mfaSessionId, emailToUse);
        setLoginLoading(false);
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

        // Start polling status
        if (pollingTimer.current) clearInterval(pollingTimer.current);
        
        pollingTimer.current = setInterval(async () => {
          try {
            const statusRes = await checkPushStatusApi(mfaSessionId);
            if (statusRes.data.success && statusRes.data.data && statusRes.data.data.approved) {
              clearInterval(pollingTimer.current);
              pollingTimer.current = null;
              setPushApproved(true);

              // Auto call verify
              setLoginLoading(true);
              const verifyRes = await verifyMfaApi({
                mfaSessionId: mfaSessionId,
                code: "PUSH",
                deviceId: deviceId,
                browserFingerprint: browserFingerprint
              });
              setLoginLoading(false);
              if (verifyRes.data.success) {
                completeLoginFlow(verifyRes.data.data, 'admin');
              } else {
                setLoginError(verifyRes.data.message || 'Xác thực Push thất bại.');
              }
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 2000);
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
        completeLoginFlow(verifyRes.data.data, 'admin');
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

  // Complete login, issue tokens, write to localStorage
  const completeLoginFlow = (result: any, username: string) => {
    const mockUser: UserSession = {
      userId: 'user_v7_8ae8f914_2352',
      username: username || 'admin',
      email: username.includes('@') ? username : 'admin@inkpulse.com',
      displayMode: 'LIGHT',
      choiceLanguage: 'VI',
      deviceTrusted: true
    };

    localStorage.setItem('inkpulse_access_token', result.accessToken);
    localStorage.setItem('inkpulse_refresh_token', result.refreshToken);
    localStorage.setItem('inkpulse_user', JSON.stringify(mockUser));

    setUser(mockUser);
    setIsLoggedIn(true);
    setCurrentPage('home');

    // Reset login states
    setLoginStage('form');
    setMfaSessionId('');
    setSupportedMethods([]);
  };

  // Mock logout
  const logoutUser = async () => {
    const rToken = localStorage.getItem('inkpulse_refresh_token');
    const aToken = localStorage.getItem('inkpulse_access_token');
    if (rToken && aToken) {
      try {
        await logoutApi(rToken, aToken);
      } catch (e) {
        // Silently logout locally
      }
    }

    localStorage.removeItem('inkpulse_access_token');
    localStorage.removeItem('inkpulse_refresh_token');
    localStorage.removeItem('inkpulse_user');

    setIsLoggedIn(false);
    setUser(null);
    setUserDropdownActive(false);
  };

  // Navigation page wrapper
  const handlePageNavigation = (page: 'home' | 'login' | 'profile' | 'book-detail') => {
    setCurrentPage(page);
    if (page === 'login') {
      setLoginStage('form');
      setLoginError(null);
    }
  };

  const handleUpdateUserCoins = (cost: number) => {
    setUserCoins((prev) => Math.max(0, prev - cost));
  };

  const handleUpdateUserProfile = (updated: Partial<UserSession>) => {
    setUser((prev) => prev ? { ...prev, ...updated } : null);
  };

  // Books lists
  const books: Book[] = [
    {
      id: 'clean-code',
      title: 'The Art of Clean Code',
      author: 'Robert C. Martin',
      price: '350.000₫',
      wasPrice: '420.000₫',
      tag: 'HOT',
      tagClass: 'sale',
      desc: 'Cuốn sách gối đầu giường của mọi nhà phát triển phần mềm muốn viết mã nguồn sạch đẹp, dễ bảo trì, và có cấu trúc thiết kế rõ ràng theo nguyên lý SOLID. Cung cấp các kỹ thuật refactoring mã nguồn chi tiết.',
      svgCover: (
        <svg className="book-cover" width="180" height="260" viewBox="0 0 180 260">
          <rect width="180" height="260" fill="#FFF0F6" rx="4"/>
          <path d="M 0,0 L 25,0 L 25,260 L 0,260 Z" fill="#F66398" opacity="0.9"/>
          <rect x="35" y="40" width="130" height="4" fill="#F66398"/>
          <text x="35" y="70" font-family="sans-serif" font-size="14" font-weight="800" fill="#1A1A1A">THE ART OF</text>
          <text x="35" y="90" font-family="sans-serif" font-size="18" font-weight="900" fill="#F66398">CLEAN CODE</text>
          <text x="35" y="120" font-family="sans-serif" font-size="10" font-style="italic" fill="#555555">Kiến tạo mã nguồn</text>
          <text x="35" y="135" font-family="sans-serif" font-size="10" font-style="italic" fill="#555555">chuẩn mực.</text>
          <circle cx="100" cy="180" r="25" fill="none" stroke="#F66398" stroke-width="2"/>
          <line x1="100" y1="155" x2="100" y2="205" stroke="#F66398" stroke-width="2"/>
          <text x="35" y="235" font-family="sans-serif" font-size="9" font-weight="600" fill="#999999">ROBERT C. MARTIN</text>
        </svg>
      ),
      attributes: {
        'Ngôn ngữ': 'Tiếng Anh (Bản dịch tiếng Việt)',
        'Nhà xuất bản': 'Addison-Wesley',
        'Hình thức': 'Bìa Cứng',
        'Số trang': '432 trang',
        'Năm xuất bản': '2024',
        'Kích thước': '16 x 24 cm'
      }
    },
    {
      id: 'cqrs',
      title: 'Enterprise CQRS & Event Sourcing',
      author: 'Vaughn Vernon',
      price: '450.000₫',
      tag: 'NEW',
      desc: 'Giải thích cặn kẽ mẫu thiết kế Command Query Responsibility Segregation (CQRS) kết hợp Event Sourcing nhằm xây dựng các hệ thống phân tán chịu tải lớn, đồng bộ dữ liệu phi đối xứng một cách trơn tru.',
      svgCover: (
        <svg className="book-cover" width="180" height="260" viewBox="0 0 180 260">
          <rect width="180" height="260" fill="#FFFFFF" rx="4" stroke="#F0F0F0" stroke-width="1"/>
          <path d="M 0,0 L 25,0 L 25,260 L 0,260 Z" fill="#1A1A1A"/>
          <rect x="35" y="40" width="130" height="4" fill="#F66398"/>
          <text x="35" y="70" font-family="sans-serif" font-size="13" font-weight="800" fill="#666666">ENTERPRISE</text>
          <text x="35" y="90" font-family="sans-serif" font-size="20" font-weight="900" fill="#1A1A1A">CQRS & EVENT</text>
          <text x="35" y="112" font-family="sans-serif" font-size="18" font-weight="800" fill="#F66398">SOURCING</text>
          <path d="M 50 150 L 140 150 L 95 195 Z" fill="none" stroke="#F66398" stroke-width="2"/>
          <text x="35" y="235" font-family="sans-serif" font-size="9" font-weight="600" fill="#999999">VAUGHN VERNON</text>
        </svg>
      ),
      attributes: {
        'Ngôn ngữ': 'Tiếng Việt',
        'Nhà xuất bản': 'O\'Reilly Media',
        'Hình thức': 'Bìa Cứng',
        'Số trang': '512 trang',
        'Năm xuất bản': '2023',
        'Kích thước': '16 x 24 cm'
      }
    },
    {
      id: 'redis',
      title: 'Mastering Redis Stack',
      author: 'Salvatore Sanfilippo',
      price: '290.000₫',
      wasPrice: '350.000₫',
      tag: 'HOT',
      tagClass: 'sale',
      desc: 'Tập trung sâu vào các tính năng nâng cao của Redis Stack như lưu trữ tài liệu JSON động, tìm kiếm Vector toàn văn (Vector Search / VSS), phân tích dữ liệu thời gian thực và quản lý Distributed Lock.',
      svgCover: (
        <svg className="book-cover" width="180" height="260" viewBox="0 0 180 260">
          <rect width="180" height="260" fill="#1A1A1A" rx="4"/>
          <path d="M 0,0 L 25,0 L 25,260 L 0,260 Z" fill="#F66398"/>
          <rect x="35" y="40" width="130" height="4" fill="#FFFFFF"/>
          <text x="35" y="70" font-family="sans-serif" font-size="14" font-weight="800" fill="#F66398">MASTERING</text>
          <text x="35" y="90" font-family="sans-serif" font-size="22" font-weight="900" fill="#FFFFFF">REDIS STACK</text>
          <text x="35" y="115" font-family="sans-serif" font-size="10" fill="#999999">JSON, VSS & High Scale Cache</text>
          <rect x="60" y="140" width="60" height="40" rx="4" fill="none" stroke="#F66398" stroke-width="2"/>
          <circle cx="90" cy="160" r="10" fill="#F66398"/>
          <text x="35" y="235" font-family="sans-serif" font-size="9" font-weight="600" fill="#999999">SALVATORE SANFILIPPO</text>
        </svg>
      ),
      attributes: {
        'Ngôn ngữ': 'Tiếng Việt',
        'Nhà xuất bản': 'Packt Publishing',
        'Hình thức': 'Bìa Mềm',
        'Số trang': '380 trang',
        'Năm xuất bản': '2024',
        'Kích thước': '15 x 23 cm'
      }
    },
    {
      id: 'microservices',
      title: 'High-Performance Microservices',
      author: 'Sam Newman',
      price: '390.000₫',
      tag: 'RECOMMENDED',
      desc: 'Hướng dẫn thiết kế kiến trúc microservices hiệu năng cao, cách kiểm soát các giao thức truyền tải bất đồng bộ (messaging queues) và giải quyết bài toán đồng bộ dữ liệu giữa các phân vùng dịch vụ độc lập.',
      svgCover: (
        <svg className="book-cover" width="180" height="260" viewBox="0 0 180 260">
          <rect width="180" height="260" fill="#FFF0F6" rx="4"/>
          <path d="M 0,0 L 25,0 L 25,260 L 0,260 Z" fill="#1A1A1A"/>
          <rect x="35" y="40" width="130" height="4" fill="#F66398"/>
          <text x="35" y="70" font-family="sans-serif" font-size="12" font-weight="800" fill="#1A1A1A">BUILDING</text>
          <text x="35" y="90" font-family="sans-serif" font-size="18" font-weight="900" fill="#F66398">MICROSERVICES</text>
          <text x="35" y="115" font-family="sans-serif" font-size="10" fill="#555555">Thiết kế hệ thống phân tán</text>
          <g stroke="#1A1A1A" stroke-width="1.5" fill="none">
            <rect x="50" y="145" width="20" height="20" rx="2"/>
            <rect x="110" y="145" width="20" height="20" rx="2"/>
            <rect x="80" y="185" width="20" height="20" rx="2"/>
            <line x1="70" y1="155" x2="80" y2="195"/>
            <line x1="110" y1="155" x2="100" y2="195"/>
          </g>
          <text x="35" y="235" font-family="sans-serif" font-size="9" font-weight="600" fill="#999999">SAM NEWMAN</text>
        </svg>
      ),
      attributes: {
        'Ngôn ngữ': 'Tiếng Việt',
        'Nhà xuất bản': 'O\'Reilly Media',
        'Hình thức': 'Bìa Cứng',
        'Số trang': '460 trang',
        'Năm xuất bản': '2022',
        'Kích thước': '16 x 24 cm'
      }
    }
  ];

  return (
    <>
      {currentPage !== 'login' && (
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          userDropdownActive={userDropdownActive}
          setUserDropdownActive={setUserDropdownActive}
          onNavigate={handlePageNavigation}
          logoutUser={logoutUser}
          coins={userCoins}
        />
      )}

      {/* Main Content Router */}
      <main style={{ flexGrow: 1 }}>
        {currentPage === 'home' && (
          <Home
            books={books}
            onSelectBook={(book) => {
              setSelectedDetailBook(book);
              setCurrentPage('book-detail');
            }}
          />
        )}
        {currentPage === 'book-detail' && selectedDetailBook && (
          <BookDetail
            book={selectedDetailBook}
            user={user}
            coins={userCoins}
            onBack={() => setCurrentPage('home')}
            onUpdateUserCoins={handleUpdateUserCoins}
            onAddToCart={(book) => toast.success(`Đã thêm "${book.title}" vào giỏ hàng!`)}
          />
        )}
        {currentPage === 'profile' && (
          <Profile
            user={user}
            onUpdateUser={handleUpdateUserProfile}
          />
        )}
        {currentPage === 'login' && (
          <Login
            loginLoading={loginLoading}
            loginStage={loginStage}
            setLoginStage={setLoginStage}
            supportedMethods={supportedMethods}
            pushSelectedNum={pushSelectedNum}
            pushApproved={pushApproved}
            onLoginSubmit={handleLoginSubmit}
            onSelectMfaMethod={selectMfaMethod}
            onOtpVerify={handleOtpVerify}
            onTotpVerify={handleTotpVerify}
            onBackToMfaSelect={() => setLoginStage('mfa_select')}
            onBackToHome={() => setCurrentPage('home')}
          />
        )}
      </main>

      <DevSandbox
        mfaSessionId={mfaSessionId}
        deviceId={deviceId}
        loginStage={loginStage}
        pushApproved={pushApproved}
        pushSelectedNum={pushSelectedNum}
        onSimulatePushApprove={simulatePushApprove}
      />

      <Footer />

      {/* Book details Modal Popup */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Toast Notification */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored" 
      />
    </>
  );
}

export default App;
