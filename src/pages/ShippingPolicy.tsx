import React from 'react';
import { useSeo } from '../hooks/useSeo';
import './StaticPage.css';

const ShippingPolicy: React.FC = () => {
  useSeo(
    'Chính Sách Giao Hàng & Đổi Trả - InkPulse',
    'Thông tin chi tiết về dịch vụ vận chuyển 24h, ship COD toàn quốc và quy định đổi trả sách tại InkPulse.'
  );

  return (
    <div className="static-page-container">
      <div className="static-page-header">
        <span className="static-badge">DỊCH VỤ VẬN CHUYỂN</span>
        <h1 className="static-title">Chính Sách Giao Hàng & Đổi Trả 24H</h1>
        <p className="static-subtitle">
          InkPulse cam kết mang tới dịch vụ vận chuyển nhanh chóng, đóng gói bọc chống sốc 3 lớp cẩn thận cho từng cuốn sách đến tay người đọc.
        </p>
      </div>

      <div className="static-open-content">
        <section className="static-section">
          <h2>1. Thời Gian & Phí Giao Hàng</h2>
          <div className="value-grid">
            <div className="value-card">
              <h3>Giao Nhanh Nội Thành (24H)</h3>
              <p>Áp dụng tại TP. Hồ Chí Minh và Hà Nội. Giao hàng hỏa tốc nhận ngay trong ngày.</p>
            </div>
            <div className="value-card">
              <h3>Giao Hàng Toàn Quốc</h3>
              <p>Thời gian từ 2 - 4 ngày làm việc tùy khu vực qua đối tác GHN / Viettel Post.</p>
            </div>
            <div className="value-card">
              <h3>Freeship Đơn Từ 300K</h3>
              <p>Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng có giá trị từ 300.000đ.</p>
            </div>
          </div>
        </section>

        <section className="static-section">
          <h2>2. Quy Định Đồng Kiểm & Kiểm Hàng</h2>
          <p>
            Khách hàng được quyền <strong>mở hộp kiểm tra sản phẩm</strong> (sách, quà tặng kèm, đĩa CD/mã code) trước khi thanh toán cho nhân viên giao hàng.
          </p>
        </section>

        <section className="static-section">
          <h2>3. Chính Sách Đổi Trả Trong 7 Ngày</h2>
          <p>
            InkPulse hỗ trợ <strong>đổi mới 100% hoàn toàn miễn phí</strong> trong vòng 7 ngày nếu sách có lỗi do nhà sản xuất (rách trang, lỗi in ấn, trầy xước bìa do vận chuyển).
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
