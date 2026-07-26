import React from 'react';
import { useSeo } from '../hooks/useSeo';
import './StaticPage.css';

const ArchitecturePage: React.FC = () => {
  useSeo(
    'Kiến Trúc Nền Tảng & Công Nghệ Enterprise - InkPulse',
    'Khám phá kiến trúc hệ thống phân tán, CQRS, Event Sourcing và hạ tầng Cloud Native của nền tảng InkPulse.'
  );

  return (
    <div className="static-page-container">
      <div className="static-page-header">
        <span className="static-badge">KỸ THUẬT & KIẾN TRÚC</span>
        <h1 className="static-title">Kiến Trúc Nền Tảng InkPulse Enterprise</h1>
        <p className="static-subtitle">
          Nền tảng InkPulse được thiết kế theo mô hình Microservices hiện đại, tối ưu hóa cho khả năng mở rộng (Scalability), tính sẵn sàng cao và xử lý giao dịch thời gian thực.
        </p>
      </div>

      <div className="static-open-content">
        <section className="static-section">
          <h2>1. Mô Hình CQRS & PipelinR</h2>
          <p>
            Tách biệt hoàn toàn luồng xử lý Ghi (Commands) và Đọc (Queries) giúp InkPulse chịu tải hàng triệu lượt truy cập đồng thời trong các đợt Flash Sale mà không ảnh hưởng tới hiệu năng cơ sở dữ liệu.
          </p>
        </section>

        <section className="static-section">
          <h2>2. Hệ Thống Caching Đa Tầng (Multi-Level Cache)</h2>
          <div className="tech-stack-grid">
            <div className="tech-card">
              <h3>Redis Stack & Section Cache</h3>
              <p>Cache phân đoạn theo domain, khóa lạc quan (Optimistic Locking) và cập nhật bù bất đồng bộ.</p>
            </div>
            <div className="tech-card">
              <h3>Elasticsearch Search Engine</h3>
              <p>Truy vấn tìm kiếm sách full-text search siêu tốc với độ trễ dưới 10ms.</p>
            </div>
            <div className="tech-card">
              <h3>RabbitMQ Message Broker</h3>
              <p>Hàng đợi thông điệp bất đồng bộ đảm bảo tính nhất quán dữ liệu giữa các dịch vụ.</p>
            </div>
          </div>
        </section>

        <section className="static-section">
          <h2>3. Hạ Tầng Kubernetes & GCP</h2>
          <p>
            Hệ thống được đóng gói Container Docker, điều phối tự động trên Google Kubernetes Engine (GKE) với khả năng Auto-scaling linh hoạt theo tải.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ArchitecturePage;
