import React, { useState, useEffect } from 'react';
import { getPublicBannersApi } from '../../api/banners';
import type { BannerResponse, BannerEditionItem } from '../../api/banners';
import BookCard from '../../features/Book/BookCard/BookCard';
import type { Book } from '../../models/Book';
import { getBookCoverSvg } from '../../utils/bookHelper';
import './BannerSection.css';

function mapBannerEditionToBook(edition: BannerEditionItem): Book {
  const priceNum = Number(edition.price) || 0;
  const oldPriceNum = edition.oldPrice ? Number(edition.oldPrice) : undefined;

  const priceDisplay = priceNum > 0 ? `${priceNum.toLocaleString('vi-VN')} đ` : 'Liên hệ';
  const wasPriceDisplay = oldPriceNum && oldPriceNum > priceNum ? `${oldPriceNum.toLocaleString('vi-VN')} đ` : undefined;

  return {
    id: edition.bookId || edition.editionId,
    title: edition.bookTitle || 'Sách Kỹ Thuật High-End',
    author: 'InkPulse Edition',
    price: priceDisplay,
    wasPrice: wasPriceDisplay,
    desc: `Mã ISBN: ${edition.isbn || 'Chưa cập nhật'}`,
    svgCover: getBookCoverSvg(edition.bookId || edition.editionId, edition.bookTitle || 'InkPulse Press', 'InkPulse Press', '#da447d'),
    realCoverUrl: edition.coverUrl || undefined,
    attributes: {
      'ISBN': edition.isbn || 'N/A',
      'Định dạng': 'Sách in cao cấp'
    }
  };
}

const BannerSection: React.FC = () => {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await getPublicBannersApi();
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setBanners(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load public banners', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading || banners.length === 0) {
    return null; // Return null gracefully if no active banners available
  }

  const currentBanner = banners[activeBannerIndex] || banners[0];

  return (
    <section className="banner-home-section" id="banner-promotions">
      {/* Banner Header */}
      <div className="banner-header">
        <div className="banner-title-wrap">
          <div className="banner-icon-badge">
            {currentBanner.iconUrl ? (
              <img src={currentBanner.iconUrl} alt="" className="banner-badge-img" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#da447d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="banner-main-title">{currentBanner.title}</h2>
            {currentBanner.subtitle && <p className="banner-subtitle">{currentBanner.subtitle}</p>}
          </div>
        </div>

        {/* Carousel indicator tabs if multiple banners exist */}
        {banners.length > 1 && (
          <div className="banner-indicator-tabs">
            {banners.map((b, idx) => (
              <button
                key={b.bannerId}
                className={`indicator-dot ${idx === activeBannerIndex ? 'active' : ''}`}
                onClick={() => setActiveBannerIndex(idx)}
                title={b.title}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Banner Hero Card */}
      <div className="banner-hero-card">
        <div className="banner-media-frame">
          <img src={currentBanner.imageUrl} alt={currentBanner.title} className="banner-hero-img" />
        </div>

        {/* Action Link Button if provided */}
        {currentBanner.linkUrl && (
          <div className="banner-cta-wrap">
            <a href={currentBanner.linkUrl} className="btn-banner-cta">
              <span>Khám Phá Ngay</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Linked Book Editions Grid */}
      {currentBanner.editions && currentBanner.editions.length > 0 && (
        <div className="banner-editions-area">
          <div className="banner-editions-title">
            <span>Sản Phẩm Khuyến Mãi Thuộc Banner</span>
            <div className="title-accent-line"></div>
          </div>
          <div className="banner-books-grid">
            {currentBanner.editions.map(item => {
              const book = mapBannerEditionToBook(item);
              return <BookCard key={item.editionId} book={book} />;
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerSection;
