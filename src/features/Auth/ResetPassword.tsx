import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { resetPasswordApi } from '../../api/auth';
import { toast } from 'react-toastify';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Mã xác thực đặt lại mật khẩu không tìm thấy trong liên kết!');
      return;
    }
    if (!newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({
        token,
        newPassword,
        confirmPassword,
      });

      toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-wrapper">
      <div className="login-card">
        <Link to={ROUTES.LOGIN} className="login-back-btn" style={{ textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Quay lại trang đăng nhập</span>
        </Link>

        <div>
          <div className="login-logo-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/344cdadf-ff0f-46da-b1f2-50c8fe2548b4.png" alt="Đặt lại mật khẩu" className="logo-img" style={{ height: '180px', marginTop: '-55px', marginBottom: '-30px', objectFit: 'contain' }} />
          </div>

          <h2 className="login-title" style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '10px' }}>
            Đặt lại mật khẩu
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
            Vui lòng nhập mật khẩu mới và xác nhận mật khẩu cho tài khoản của bạn.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  required
                  style={{ paddingRight: '56px' }}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
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

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                  style={{ paddingRight: '56px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? <span className="btn-spinner"></span> : 'Xác nhận thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
