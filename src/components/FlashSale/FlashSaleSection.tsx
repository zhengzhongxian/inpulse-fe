import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveFlashSalesApi } from '../../api/flashsales';
import type { FlashSaleItemResponse } from '../../api/flashsales';
import './FlashSaleSection.css';

const FlashSaleSection: React.FC = () => {
  const navigate = navigateHook();
  const [sales, setSales] = useState<FlashSaleItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [countdownLabel, setCountdownLabel] = useState('KẾT THÚC SAU:');

  function navigateHook() {
    return useNavigate();
  }

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await getActiveFlashSalesApi();
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setSales(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load active flash sales', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Countdown timer calculation
  useEffect(() => {
    if (sales.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();

      const runningSales = sales.filter(s => new Date(s.startDate).getTime() <= now && new Date(s.endDate).getTime() >= now);
      const upcomingSales = sales.filter(s => new Date(s.startDate).getTime() > now);

      let targetDate = 0;
      if (runningSales.length > 0) {
        targetDate = Math.min(...runningSales.map(s => new Date(s.endDate).getTime()));
        setCountdownLabel('KẾT THÚC SAU:');
      } else if (upcomingSales.length > 0) {
        targetDate = Math.min(...upcomingSales.map(s => new Date(s.startDate).getTime()));
        setCountdownLabel('BẮT ĐẦU SAU:');
      } else {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        fetchSales();
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sales]);

  if (loading || sales.length === 0) {
    return null;
  }

  const formatVnd = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ';
  };

  const handleBuyNow = (sale: FlashSaleItemResponse) => {
    // Navigate to book details passing editionId and flashSaleItemId in query params as flashSaleId
    navigate(`/book/${sale.bookEditionId}?editionId=${sale.bookEditionId}&flashSaleId=${sale.flashSaleItemId}`);
  };

  return (
    <section className="flash-sale-home-section">
      <div className="flash-sale-header">
        <div className="flash-sale-title-wrap">
          <div className="bolt-icon-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="yellow-bolt">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <h2 className="flash-sale-main-title">Flash Sale</h2>
        </div>
        
        {/* Countdown Timer */}
        <div className="flash-sale-countdown">
          <span className="countdown-label">{countdownLabel}</span>
          <div className="countdown-boxes">
            <div className="time-box">{String(timeLeft.hours).padStart(2, '0')}</div>
            <span className="time-colon">:</span>
            <div className="time-box">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <span className="time-colon">:</span>
            <div className="time-box">{String(timeLeft.seconds).padStart(2, '0')}</div>
          </div>
        </div>
      </div>

      <div className="flash-sale-grid">
        {sales.map((sale) => {
          const now = new Date().getTime();
          const isUpcoming = new Date(sale.startDate).getTime() > now;
          const soldPercentage = sale.flashSaleStock > 0 ? (sale.soldCount / sale.flashSaleStock) * 100 : 0;
          const discountPercent = (sale.originalPrice && sale.originalPrice > 0)
            ? Math.round(((sale.originalPrice - sale.flashSalePrice) / sale.originalPrice) * 100)
            : 0;
          return (
            <div key={sale.flashSaleItemId} className={`flash-sale-card ${isUpcoming ? 'upcoming' : ''}`} onClick={() => handleBuyNow(sale)}>
              <div className="flash-sale-cover-wrap">
                <span className="discount-tag">-{discountPercent}%</span>
                <img src={sale.thumbnailUrl || '/book-placeholder.jpg'} alt={sale.bookTitle} className="flash-sale-cover" />
              </div>
              <div className="flash-sale-details">
                <h3 className="flash-sale-book-title">{sale.bookTitle}</h3>
                
                <div className="flash-sale-price-row">
                  <span className="flash-sale-price-now">{formatVnd(sale.flashSalePrice)}</span>
                  <span className="flash-sale-price-old">{formatVnd(sale.originalPrice)}</span>
                </div>

                {/* Stock Progress Bar */}
                <div className="flash-sale-stock-progress-wrap">
                  <div className="progress-info">
                    {isUpcoming ? (
                      <span className="upcoming-stock-info">
                        Số lượng mở bán: <strong className="upcoming-stock-num">{sale.flashSaleStock}</strong>
                      </span>
                    ) : (
                      <>
                        <span>Đã bán {sale.soldCount}</span>
                        <span>Tồn kho {sale.flashSaleStock}</span>
                      </>
                    )}
                  </div>
                  {!isUpcoming && (
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min(100, soldPercentage)}%` }}
                      />
                    </div>
                  )}
                </div>

                <button 
                  className={`btn-buy-flash-sale ${isUpcoming ? 'disabled' : ''}`} 
                  disabled={isUpcoming}
                  onClick={(e) => { e.stopPropagation(); if (!isUpcoming) handleBuyNow(sale); }}
                >
                  {isUpcoming ? 'Sắp mở bán' : 'Mua ngay'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FlashSaleSection;
