import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { forgotPasswordApi } from '../../api/auth';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }
    
    setLoading(true);
    try {
      let deviceId = localStorage.getItem('inkpulse_device_id') || '';
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('inkpulse_device_id', deviceId);
      }
      
      const response = await forgotPasswordApi({
        email,
        deviceId,
        browserFingerprint: 'browser_fp_mock',
      });
      
      toast.success(response.data.message || 'Yêu cầu đặt lại mật khẩu thành công!');
      setIsSent(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu.';
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

        {isSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ color: '#F66398', marginBottom: '20px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"></path>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
            <h2 className="login-title" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color)', marginBottom: '12px' }}>
              Kiểm tra hộp thư
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              Một liên kết đặt lại mật khẩu đã được gửi đến địa chỉ <strong>{email}</strong>. Vui lòng kiểm tra email của bạn để tiếp tục.
            </p>
            <Link to={ROUTES.LOGIN} className="btn-secondary btn-submit" style={{ display: 'inline-block', textDecoration: 'none', lineHeight: '45px', textAlign: 'center' }}>
              Về trang đăng nhập
            </Link>
          </div>
        ) : (
          <div>
            <div className="login-logo-container" style={{ display: 'flex', justifyContent: 'center' }}>
              <img src="/344cdadf-ff0f-46da-b1f2-50c8fe2548b4.png" alt="Quên mật khẩu" className="logo-img" style={{ height: '180px', marginTop: '-55px', marginBottom: '-30px', objectFit: 'contain' }} />
            </div>
            
            <h2 className="login-title" style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '10px' }}>
              Quên mật khẩu?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
              Nhập email liên kết với tài khoản của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email tài khoản</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                {loading ? <span className="btn-spinner"></span> : 'Gửi yêu cầu'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default ForgotPassword;
