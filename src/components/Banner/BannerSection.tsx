import React, { useState } from 'react';
import type { BannerResponse } from '../../api/banners';
import './BannerSection.css';

const ITEMS_PER_PAGE = 16; // 16 banner mỗi trang (8 hàng trên, 8 hàng dưới)

// Fake Data 32 Banner Quảng cáo hình chữ nhật ngang, lấp đầy 100% khung
const FAKE_BANNERS: BannerResponse[] = [
  { bannerId: 'f1', title: 'Khóa Học Fullstack Spring & React', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f2', title: 'Kiến Trúc Microservices Cao Cấp', imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 2, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f3', title: 'Tối Ưu Hiệu Năng Redis Stack', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 3, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f4', title: 'Lập Trình Phần Cứng & Embedded', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 4, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f5', title: 'Hệ Thống Phân Tán High Availability', imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 5, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f6', title: 'Hội Thảo Công Nghệ InkPulse 2026', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 6, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f7', title: 'Thiết Kế UI/UX Cho Developer', imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 7, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f8', title: 'Lập Trình Python & Data Science', imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 8, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f9', title: 'Bí Quyết Làm Chủ IDE IntelliJ', imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 9, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f10', title: 'Học Trực Tuyến Bản Quyền InkPulse', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 10, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f11', title: 'Khóa Học HTML5 CSS3 Chuyên Sâu', imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 11, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f12', title: 'Ứng Dụng Toán Học Trong Machine Learning', imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 12, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f13', title: 'Bảo Mật An Ninh Mạng Doanh Nghiệp', imageUrl: 'https://images.unsplash.com/photo-1526374870839-e155464bb9b2?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 13, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f14', title: 'Thực Chiến Lập Trình Frontend React', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 14, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f15', title: 'Điện Toán Đám Mây & Hạ Tầng Mạng', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 15, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f16', title: 'Quản Trị Máy Chủ Data Center', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 16, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  // Page 2
  { bannerId: 'f17', title: 'DevOps & CI/CD Pipeline Automation', imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 17, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f18', title: 'Lập Trình Modern JavaScript ES6+', imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 18, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f19', title: 'Thiết Kế Cơ Sở Dữ Liệu PostgreSQL', imageUrl: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 19, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f20', title: 'Phân Tích Dữ Liệu Lớn Big Data', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 20, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f21', title: 'Lập Trình Ứng Dụng Di Động React Native', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 21, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f22', title: 'Xây Dựng Website Thương Mại Điện Tử', imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 22, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f23', title: 'Cuộc Thi Hackathon InkPulse 2026', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 23, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f24', title: 'Hội Thảo Chuyên Đề Software Engineering', imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 24, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f25', title: 'Tự Động Hóa Trí Tuệ Nhân Tạo AI', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 25, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f26', title: 'Lập Trình Mô Hình Deep Learning', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 26, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f27', title: 'Hệ Thống Lưu Trữ Đám Mây Cloud', imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 27, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f28', title: 'Đổi Mới Sáng Tạo Công Nghệ Số', imageUrl: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 28, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f29', title: 'Góc Làm Việc Developer Chuyên Nghiệp', imageUrl: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 29, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f30', title: 'Xây Dựng Chatbot AI Thông Minh', imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 30, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f31', title: 'Cấu Trúc Dữ Liệu & Giải Thuật Thực Chiến', imageUrl: 'https://images.unsplash.com/photo-1516116211223-48a12725dd24?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 31, isActive: true, createdAt: '', updatedAt: '', editions: [] },
  { bannerId: 'f32', title: 'Tối Ưu Mã Nguồn & Code Refactoring', imageUrl: 'https://images.unsplash.com/photo-1526925539332-aa3b66e35444?w=500&auto=format&fit=crop&q=80', linkUrl: '#', displayOrder: 32, isActive: true, createdAt: '', updatedAt: '', editions: [] }
];

const BannerSection: React.FC = () => {
  const [banners] = useState<BannerResponse[]>(FAKE_BANNERS);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);

  // Chia mảng thành các trang (mỗi trang 16 banner)
  const pages: BannerResponse[][] = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(banners.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : totalPages));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1));
  };

  return (
    <section className="banner-home-section" id="banner-promotions">
      {/* Header Banner Section (Icon + Title giống Flash Sale) */}
      <div className="banner-header">
        <div className="banner-title-wrap">
          <div className="banner-icon-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#da447d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 className="banner-main-title">Chương Trình Khuyến Mãi & Đối Tác</h2>
        </div>
      </div>

      {/* Outer Layout: 2 Nút Hồng 2 bên + Viewport trượt trang mượt mà */}
      <div className="banner-carousel-outer">
        {/* Nút lùi bên trái MÀU HỒNG (#da447d), KHÔNG viền */}
        <button
          className="banner-side-nav-btn prev"
          onClick={handlePrevPage}
          title="Trang trước"
          aria-label="Previous page"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Viewport trượt giữa các trang khi bấm nút hoặc bấm chấm tròn */}
        <div className="banner-pages-viewport">
          <div
            className="banner-pages-track"
            style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
          >
            {pages.map((pageBanners, pageIdx) => {
              const topRow = pageBanners.slice(0, 8);
              const bottomRow = pageBanners.slice(8, 16);

              // Lặp lại 4 lần để khi translateX(-1200px) khớp đúng 100% tọa độ Pixel, lướt vô tận không vệt tốc biến
              const topMarquee = [...topRow, ...topRow, ...topRow, ...topRow];
              const bottomMarquee = [...bottomRow, ...bottomRow, ...bottomRow, ...bottomRow];

              return (
                <div key={pageIdx} className="banner-single-page">
                  {/* Hàng 1 (Trên): Marquee lướt sang trái liền mạch */}
                  <div className="banner-marquee-row">
                    <div className="banner-marquee-track track-top">
                      {topMarquee.map((b, idx) => (
                        <a
                          key={`top_${pageIdx}_${b.bannerId}_${idx}`}
                          href={b.linkUrl || '#'}
                          target={b.linkUrl && b.linkUrl.startsWith('http') ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="banner-grid-card"
                          title={b.title}
                        >
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="banner-card-img"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = '0.4';
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Hàng 2 (Dưới): Marquee lướt sang phải liền mạch */}
                  <div className="banner-marquee-row">
                    <div className="banner-marquee-track track-bottom">
                      {bottomMarquee.map((b, idx) => (
                        <a
                          key={`bottom_${pageIdx}_${b.bannerId}_${idx}`}
                          href={b.linkUrl || '#'}
                          target={b.linkUrl && b.linkUrl.startsWith('http') ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="banner-grid-card"
                          title={b.title}
                        >
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="banner-card-img"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = '0.4';
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút tiến bên phải MÀU HỒNG (#da447d), KHÔNG viền */}
        <button
          className="banner-side-nav-btn next"
          onClick={handleNextPage}
          title="Trang sau"
          aria-label="Next page"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dấu chấm MÀU XANH DƯƠNG (#0ea5e9), KHÔNG phát sáng */}
      <div className="banner-blue-dots">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={`blue-dot ${idx + 1 === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(idx + 1)}
            title={`Trang ${idx + 1}`}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerSection;
