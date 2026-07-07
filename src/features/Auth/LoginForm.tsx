import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../context/LoginContext';
import { ROUTES } from '../../config/routes';
import { toast } from 'react-toastify';
import { googleLoginApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

function LoginForm() {
  const {
    loginError,
    loginLoading,
    loginStage,
    setLoginStage,
    supportedMethods,
    pushSelectedNum,
    pushApproved,
    handleLoginSubmit: onLoginSubmit,
    selectMfaMethod: onSelectMfaMethod,
    handleTotpVerify: onTotpVerify,
    mfaMaskedEmail = '',
  } = useLogin();

  const navigate = useNavigate();
  const { completeLoginFlow } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    if (!idToken) return;

    setGoogleLoading(true);
    try {
      let deviceId = localStorage.getItem('inkpulse_device_id') || '';
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('inkpulse_device_id', deviceId);
      }

      const res = await googleLoginApi({
        idToken,
        deviceId,
        browserFingerprint: 'browser_fp_mock',
        deviceName: 'Browser Client',
        deviceType: 'DESKTOP',
      });

      const loginResult = res.data.data;
      if (loginResult.registered) {
        completeLoginFlow(loginResult, '', loginResult.email);
        toast.success('Đăng nhập bằng Google thành công!');
        navigate(ROUTES.HOME);
        window.location.reload();
      } else {
        navigate(ROUTES.REGISTER_GOOGLE, {
          state: {
            googleUserId: loginResult.googleUserId,
            email: loginResult.email,
            name: loginResult.name,
            picture: loginResult.picture,
          },
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Đăng nhập Google thất bại.';
      toast.error(errMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (loginStage !== 'form') return;

    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeGoogleBtn = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '582072296011-h3fn4gs64e6ng9930bpnuek3p7ck98vo.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        const container = document.getElementById('google-login-btn');
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: 'signin_with',
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleBtn;
      document.body.appendChild(script);
    } else {
      // Delay slightly to ensure DOM element #google-login-btn is mounted
      const timer = setTimeout(initializeGoogleBtn, 100);
      return () => clearTimeout(timer);
    }
  }, [loginStage]);

  useEffect(() => {
    if (loginError) {
      toast.error(loginError);
    }
  }, [loginError]);

  const onBackToMfaSelect = () => setLoginStage('mfa_select');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [totpValue, setTotpValue] = useState<string[]>(Array(6).fill(''));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSubmit(usernameInput, passwordInput);
  };

  const handleTotpBoxChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const nextValue = [...totpValue];
    nextValue[index] = element.value;
    setTotpValue(nextValue);

    // Focus next box
    if (element.nextElementSibling && element.value) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };


  const executeTotpVerify = () => {
    onTotpVerify(totpValue.join(''));
  };

  return (
    <section className="login-wrapper">
      <div className="login-card">
        <Link to={ROUTES.HOME} className="login-back-btn" style={{ textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Quay lại trang chủ</span>
        </Link>

        {loginStage === 'form' && (
          <div>
            <div className="login-logo-container" style={{ display: 'flex', justifyContent: 'center' }}>
              <img src="/344cdadf-ff0f-46da-b1f2-50c8fe2548b4.png" alt="Chào mừng" className="logo-img" style={{ height: '180px', marginTop: '-55px', marginBottom: '-30px', objectFit: 'contain' }} />
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Tài khoản</label>
                <input
                  type="text"
                  className="form-input"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc địa chỉ email..."
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu bảo mật..."
                    autoComplete="current-password"
                    style={{ paddingRight: '56px' }}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Ghi nhớ thiết bị</span>
                </label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-password">Quên mật khẩu?</Link>
              </div>

              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={loginLoading || googleLoading}
              >
                {loginLoading ? <span className="btn-spinner"></span> : 'Đăng Nhập'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
                <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                <span style={{ padding: '0 12px', fontSize: '13px' }}>hoặc</span>
                <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>

              <div id="google-login-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>

              <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                Chưa có tài khoản?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* MFA Selector Selection */}
        {loginStage === 'mfa_select' && (
          <div className="mfa-stage">
            <h2 className="mfa-title">Bảo mật lớp 2</h2>
            <p className="login-subtitle">
              Tài khoản của bạn đã cấu hình Xác thực 2 lớp (MFA). Vui lòng chọn phương thức:
            </p>

            <div className="mfa-selector">
              {supportedMethods.length > 0 ? (
                supportedMethods.map(method => (
                  <div className="mfa-option" key={method.type} onClick={() => onSelectMfaMethod(method.type)}>
                    <div className="mfa-option-icon">
                      {method.type === 'EMAIL' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      )}
                      {method.type === 'TOTP' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 11 11 13 15 9" />
                        </svg>
                      )}
                      {method.type === 'PUSH' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      )}
                    </div>
                    <div className="mfa-option-details">
                      <h4>{method.displayName}</h4>
                      <p>
                        {method.type === 'EMAIL' && "Nhận mã xác thực số khớp qua hòm thư email liên kết"}
                        {method.type === 'TOTP' && "Nhập mã OTP tạo từ ứng dụng Google Authenticator"}
                        {method.type === 'PUSH' && "Đồng ý trực tiếp từ thông báo đẩy trên điện thoại"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                  Không tải được cấu hình MFA của tài khoản này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MFA Email OTP input */}
        {loginStage === 'mfa_otp' && (
          <div className="mfa-stage">
            <h2 className="mfa-title">Xác nhận số khớp</h2>
            <p className="login-subtitle">
              Một email chứa 3 lựa chọn số đã được gửi tới {mfaMaskedEmail ? <strong>{mfaMaskedEmail}</strong> : 'email của bạn'}.
            </p>

            <div className="mfa-challenge-box" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: '24px 0',
              padding: '24px 20px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '0'
            }}>
              {pushApproved ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
                  <div className="spinning-success-circle" style={{
                    width: '54px',
                    height: '54px',
                    border: '4px solid rgba(246, 99, 152, 0.1)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '16px'
                  }}></div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>Đang xác thực thông tin...</span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số hiển thị trên màn hình:</span>
                  <div style={{
                    fontSize: '54px',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: '1',
                    marginBottom: '16px'
                  }}>
                    {pushSelectedNum}
                  </div>
                  <p style={{ fontSize: '13.5px', textAlign: 'center', color: 'var(--text-muted)', margin: '0', lineHeight: '1.5' }}>
                    Vui lòng mở hộp thư, tìm email từ <strong>InkPulse</strong> và nhấp chọn đúng con số được hiển thị ở trên.
                  </p>
                </>
              )}
            </div>

            <div className="mfa-loading-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '16px 0' }}>
              {pushApproved ? (
                <span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 600 }}>Khớp số thành công! Đang chuyển hướng...</span>
              ) : (
                <>
                  <span className="btn-spinner" style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(246, 99, 152, 0.1)', borderLeftColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Đang chờ bạn bấm xác nhận từ email...</span>
                </>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                className="btn-link"
                disabled={loginLoading}
                onClick={() => onSelectMfaMethod('EMAIL')}
                style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  textDecoration: 'underline'
                }}
              >
                Gửi lại email xác thực
              </button>
            </div>

            <button
              className="btn-link"
              onClick={onBackToMfaSelect}
              style={{
                display: 'block',
                margin: '16px auto 0 auto',
                color: 'var(--primary)',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Chọn phương thức bảo mật khác
            </button>
          </div>
        )}

        {/* MFA TOTP code input */}
        {loginStage === 'mfa_totp' && (
          <div className="mfa-stage">
            <h2 className="mfa-title">Google Authenticator</h2>
            <p className="login-subtitle">
              Nhập mã bảo mật 6 số từ ứng dụng Google Authenticator App.
            </p>

            <div className="otp-inputs">
              {totpValue.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="otp-box"
                  value={data}
                  onChange={(e) => handleTotpBoxChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button
              className="btn-primary btn-submit"
              onClick={executeTotpVerify}
              disabled={loginLoading}
            >
              {loginLoading ? <span className="btn-spinner"></span> : 'Xác nhận mã'}
            </button>

            <button
              className="btn-secondary btn-submit"
              style={{ marginTop: '12px' }}
              onClick={onBackToMfaSelect}
            >
              Quay lại
            </button>
          </div>
        )}

        {/* MFA Push Prompt Google Style */}
        {loginStage === 'mfa_push' && (
          <div className="mfa-stage">
            <h2 className="mfa-title">Google Push Prompt</h2>
            <p className="login-subtitle" style={{ marginBottom: '20px' }}>
              Một yêu cầu đăng nhập đã được gửi đến thiết bị di động của bạn.
            </p>

            <div className="google-push-mock">
              <div className="phone-animation">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  {pushApproved ? (
                    <div style={{ color: '#00C853', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginBottom: '8px', color: '#00C853' }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <p>ĐỒNG Ý!</p>
                    </div>
                  ) : (
                    <>
                      <div className="prompt-number">{pushSelectedNum}</div>
                      <div className="phone-text">Hãy chọn số này trên thiết bị di động của bạn</div>
                      <div className="pulse-dot"></div>
                    </>
                  )}
                </div>
              </div>

              {!pushApproved && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Đang chờ phản hồi xác thực... (Tự động cập nhật qua Polling)
                </p>
              )}
            </div>

            <button
              className="btn-secondary btn-submit"
              onClick={onBackToMfaSelect}
              disabled={loginLoading}
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default LoginForm;
