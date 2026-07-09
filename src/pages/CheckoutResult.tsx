import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { ROUTES } from '../config/routes';
import './CheckoutResult.css';

function CheckoutResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');
  const cancel = searchParams.get('cancel');

  const isSuccess = code === '00' || status === 'PAID' || (status === 'success' && cancel !== 'true');

  useSeo(
    isSuccess ? 'Thanh toán thành công | InkPulse Bookstore' : 'Thanh toán thất bại | InkPulse Bookstore',
    'Thông báo kết quả giao dịch thanh toán đơn hàng tại hệ thống nhà sách InkPulse.'
  );

  useEffect(() => {
    // If no orderCode or code is provided, redirect to home to prevent stray navigation
    if (!orderCode) {
      const timer = setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderCode, navigate]);

  return (
    <div className="checkout-result-container">
      <div className={`checkout-result-card ${isSuccess ? 'success-card' : 'error-card'}`}>
        {isSuccess ? (
          <>
            <div className="result-icon-wrapper success-icon-animate">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h1 className="result-title text-success">Thanh Toán Thành Công!</h1>
            <p className="result-desc">
              Cảm ơn bạn đã mua sắm tại InkPulse. Đơn hàng của bạn đã được thanh toán thành công và đang được hệ thống chuyển tiếp đi xử lý đóng gói.
            </p>
            {orderCode && (
              <div className="order-code-badge">
                Mã đơn hàng: <strong>#{orderCode}</strong>
              </div>
            )}
            <div className="result-actions">
              <button className="btn-primary" onClick={() => navigate(ROUTES.BOOKS)}>
                Tiếp tục mua sắm
              </button>
              <button className="btn-secondary" onClick={() => navigate(ROUTES.HOME)}>
                Về trang chủ
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="result-icon-wrapper error-icon-animate">
              <svg className="crossmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="crossmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="crossmark__line" fill="none" d="M16 16l20 20" />
                <path className="crossmark__line" fill="none" d="M36 16L16 36" />
              </svg>
            </div>
            <h1 className="result-title text-danger">Thanh Toán Thất Bại / Hủy Bỏ</h1>
            <p className="result-desc">
              Giao dịch thanh toán cho đơn hàng đã bị hủy hoặc không thành công. Hệ thống đã tự động hoàn trả số lượng sách về tồn kho. Bạn có thể kiểm tra lại giỏ hàng và thử lại.
            </p>
            {orderCode && (
              <div className="order-code-badge error-badge">
                Mã đơn hàng: <strong>#{orderCode}</strong>
              </div>
            )}
            <div className="result-actions">
              <button className="btn-primary" onClick={() => navigate(ROUTES.CART)}>
                Quay lại giỏ hàng
              </button>
              <button className="btn-secondary" onClick={() => navigate(ROUTES.HOME)}>
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutResult;
