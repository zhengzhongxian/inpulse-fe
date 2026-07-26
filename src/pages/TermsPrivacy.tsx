import React from 'react';
import { useSeo } from '../hooks/useSeo';
import './StaticPage.css';

const TermsPrivacy: React.FC = () => {
  useSeo(
    'Điều Khoản Sử Dụng & Bảo Mật - InkPulse',
    'Cam kết bảo mật thông tin cá nhân và quy định sử dụng dịch vụ tại hệ thống nhà sách trực tuyến InkPulse.'
  );

  return (
    <div className="static-page-container">
      <div className="static-page-header">
        <span className="static-badge">QUY ĐỊNH & BẢO MẬT</span>
        <h1 className="static-title">Điều Khoản Sử Dụng & Bảo Mật Khách Hàng</h1>
        <p className="static-subtitle">
          Tôn trọng và bảo vệ thông tin cá nhân của người dùng là ưu tiên hàng đầu trong mọi hoạt động của InkPulse.
        </p>
      </div>

      <div className="static-open-content">
        <section className="static-section">
          <h2>1. Thu Thập & Sử Dụng Thông Tin</h2>
          <p>
            InkPulse chỉ thu thập các thông tin cần thiết để xử lý đơn hàng và cung cấp dịch vụ (Họ tên, Số điện thoại, Địa chỉ giao hàng, Email). Chúng tôi cam kết <strong>không chia sẻ hay bán thông tin cá nhân</strong> cho bên thứ ba vì mục đích thương mại.
          </p>
        </section>

        <section className="static-section">
          <h2>2. An Toàn Thanh Toán</h2>
          <p>
            Mọi giao dịch thanh toán qua thẻ ngân hàng, MoMo, VNPay hoặc Chuyển khoản đều được mã hóa theo tiêu chuẩn SSL/TLS 256-bit cao nhất, đảm bảo tuyệt đối an toàn dữ liệu tài chính của khách hàng.
          </p>
        </section>

        <section className="static-section">
          <h2>3. Tài Khoản & Trách Nhiệm Người Dùng</h2>
          <p>
            Người dùng có trách nhiệm bảo mật mật khẩu và thông tin tài khoản cá nhân. InkPulse cam kết hỗ trợ khôi phục và bảo vệ tài khoản người dùng 24/7 khi xảy ra sự cố kỹ thuật.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPrivacy;
