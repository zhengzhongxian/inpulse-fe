import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { Book, UserSession } from '../../types';
import './BookDetail.css';

interface LocationData {
  [province: string]: {
    [district: string]: string[];
  };
}

const GHN_MOCK_DATA: LocationData = {
  'TP. Hồ Chí Minh': {
    'Quận 5': ['Phường 4', 'Phường 9', 'Phường 14'],
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Phạm Ngũ Lão'],
    'Quận 10': ['Phường 1', 'Phường 12', 'Phường 15'],
    'TP. Thủ Đức': ['Phường Linh Trung', 'Phường Thảo Điền', 'Phường Bình Thọ']
  },
  'Hà Nội': {
    'Quận Hoàn Kiếm': ['Phường Hàng Đào', 'Phường Tràng Tiền', 'Phường Lý Thái Tổ'],
    'Quận Ba Đình': ['Phường Trúc Bạch', 'Phường Cống Vị', 'Phường Kim Mã'],
    'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Mai Dịch', 'Phường Nghĩa Tân']
  },
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Thạch Thang', 'Phường Hòa Cường Bắc', 'Phường Hải Châu I'],
    'Quận Thanh Khê': ['Phường An Khê', 'Phường Thanh Khê Tây', 'Phường Hòa Khê'],
    'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường Thọ Quang']
  }
};

interface BookDetailProps {
  book: Book;
  user: UserSession | null;
  coins: number;
  onBack: () => void;
  onUpdateUserCoins: (amount: number) => void;
  onAddToCart: (book: Book) => void;
}

function BookDetail({ book, user, coins, onBack, onUpdateUserCoins, onAddToCart }: BookDetailProps) {
  // Buy checkout flow state
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [purchaseStep, setPurchaseStep] = useState<1 | 2 | 3>(1);

  // Delivery details (form-less fields)
  const [phone, setPhone] = useState<string>('0908123456');
  const [address, setAddress] = useState<string>('280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh');
  const [recipientName, setRecipientName] = useState<string>(user?.username || 'Lê Trung Hiển');

  // GHN Address mode
  const [addressType, setAddressType] = useState<'default' | 'custom'>('default');
  const [province, setProvince] = useState<string>('TP. Hồ Chí Minh');
  const [district, setDistrict] = useState<string>('Quận 5');
  const [ward, setWard] = useState<string>('Phường 4');
  const [street, setStreet] = useState<string>('280 An Dương Vương');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'payos' | 'vnpay'>('cash');

  // Slideshow state for book covers
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'intro' | 'specs'>('intro');

  // Auto-slide every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 30000); // 30s
    return () => clearInterval(timer);
  }, []);

  // Convert price string (e.g., "129.000đ") to a numeric coin amount for payment
  const coinCost = parseInt(book.price.replace(/[^\d]/g, '')) / 1000 || 50; 

  const discountPercent = book.wasPrice 
    ? Math.round((1 - parseInt(book.price.replace(/[^\d]/g, '')) / parseInt(book.wasPrice.replace(/[^\d]/g, ''))) * 100)
    : 0;

  const handleNextStep = () => {
    if (purchaseStep === 1) {
      if (!recipientName || !phone) {
        toast.error('Vui lòng điền tên người nhận và số điện thoại.');
        return;
      }
      if (addressType === 'custom') {
        if (!province || !district || !ward || !street.trim()) {
          toast.error('Vui lòng nhập đầy đủ các trường địa chỉ giao hàng.');
          return;
        }
        setAddress(`${street.trim()}, ${ward}, ${district}, ${province}`);
      } else {
        setAddress('280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh');
      }
      setPurchaseStep(2);
    }
  };

  const handleConfirmPurchase = () => {
    if (paymentMethod === 'payos') {
      window.open('https://pay.payos.vn/', '_blank');
      setPurchaseStep(3);
      toast.success(`Đang mở cổng thanh toán PayOS cho sách "${book.title}"!`);
    } else if (paymentMethod === 'vnpay') {
      window.open('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', '_blank');
      setPurchaseStep(3);
      toast.success(`Đang mở cổng thanh toán VNPay cho sách "${book.title}"!`);
    } else {
      setPurchaseStep(3);
      toast.success(`Đặt hàng thành công với hình thức thanh toán Tiền mặt!`);
    }
  };

  const handleCancelPurchase = () => {
    setIsBuying(false);
    setPurchaseStep(1);
    setPaymentMethod('cash');
  };

  const slides = [
    book.svgCover,
    <img 
      src="https://vn-live-02.slatic.net/p/cccf3708877617a0461545a53e97c69c.jpg" 
      alt="Book Cover Link" 
      className="book-cover" 
      key="slide-2" 
    />,
    <svg className="book-cover" width="180" height="260" viewBox="0 0 180 260" key="slide-3">
      <rect width="180" height="260" fill="#1C1C1C" rx="0"/>
      <line x1="10" y1="10" x2="170" y2="10" stroke="#F66398" strokeWidth="1" opacity="0.3"/>
      <line x1="10" y1="250" x2="170" y2="250" stroke="#F66398" strokeWidth="1" opacity="0.3"/>
      <path d="M 152,0 L 180,0 L 180,260 L 152,260 Z" fill="#F66398" opacity="0.8"/>
      <text x="20" y="50" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill="#FFFFFF">{book.title.toUpperCase()}</text>
      <text x="20" y="68" fontFamily="sans-serif" fontSize="9" fontWeight="600" fill="#F66398">{book.author}</text>
      <rect x="20" y="95" width="110" height="1" fill="#FFFFFF" opacity="0.2"/>
      <text x="20" y="115" fontFamily="sans-serif" fontSize="7.5" fill="#CCCCCC" lineHeight="1.5">Tác phẩm mang tính cách mạng</text>
      <text x="20" y="128" fontFamily="sans-serif" fontSize="7" fill="#999">giúp giải quyết triệt để các thách thức</text>
      <text x="20" y="140" fontFamily="sans-serif" fontSize="7" fill="#999">lập trình ứng dụng phân tán thực tế.</text>
      <g transform="translate(20, 185)" fill="#FFFFFF">
        <rect x="0" y="0" width="80" height="38" rx="2"/>
        <rect x="6" y="5" width="2" height="22" fill="#000000"/>
        <rect x="10" y="5" width="4" height="22" fill="#000000"/>
        <rect x="16" y="5" width="1" height="22" fill="#000000"/>
        <rect x="19" y="5" width="3" height="22" fill="#000000"/>
        <rect x="24" y="5" width="2" height="22" fill="#000000"/>
        <rect x="28" y="5" width="1" height="22" fill="#000000"/>
        <rect x="31" y="5" width="4" height="22" fill="#000000"/>
        <rect x="37" y="5" width="2" height="22" fill="#000000"/>
        <rect x="41" y="5" width="3" height="22" fill="#000000"/>
        <rect x="46" y="5" width="1" height="22" fill="#000000"/>
        <rect x="49" y="5" width="4" height="22" fill="#000000"/>
        <rect x="55" y="5" width="1" height="22" fill="#000000"/>
        <rect x="58" y="5" width="2" height="22" fill="#000000"/>
        <rect x="62" y="5" width="3" height="22" fill="#000000"/>
        <rect x="67" y="5" width="1" height="22" fill="#000000"/>
        <rect x="70" y="5" width="4" height="22" fill="#000000"/>
        <rect x="76" y="5" width="1" height="22" fill="#000000"/>
        <text x="14" y="33" fontFamily="sans-serif" fontSize="5.5" fill="#000000">9780132350884</text>
      </g>
    </svg>
  ];

  return (
    <div className="detail-wrapper">
      {/* Back Button */}
      <div className="detail-back-btn" onClick={onBack}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Quay lại trang chủ</span>
      </div>

      <div className="detail-container">
        {/* Left Side: Product Cover Slideshow */}
        <div className="detail-cover-sec-container">
          <div className="detail-cover-sec">
            {slides[currentSlide]}
          </div>
          <div className="cover-dots">
            {slides.map((_, index) => (
              <span 
                key={index} 
                className={`cover-dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="detail-info-sec">
          <span className="detail-author">{book.author}</span>
          <h1 className="detail-title">{book.title}</h1>

          {/* Rating, Reviews and Sales volumes */}
          <div className="detail-rating-row">
            <div className="rating-stars">
              <span className="rating-score">4.9</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
            <span className="divider-dot">•</span>
            <span className="rating-count">86 Đánh giá</span>
            <span className="divider-dot">•</span>
            <span className="sold-count">Đã bán 312</span>
          </div>

          <div className="detail-tags-row">
            <span className="detail-tag highlight">{book.tag || 'Sách Mới'}</span>
            <span className="detail-tag">Bản Đẹp Bìa Cứng</span>
            <span className="detail-tag">Hỗ trợ giao nhanh</span>
          </div>

          <p className="detail-desc">{book.desc}</p>

          <div className="detail-price-box">
            <span className="detail-price-label">Giá bán chính thức</span>
            <div className="detail-price-row-wrapper">
              <span className="detail-price-now">{book.price}</span>
              {book.wasPrice && (
                <>
                  <span className="detail-price-was">{book.wasPrice}</span>
                  <span className="detail-price-discount">-{discountPercent}%</span>
                </>
              )}
            </div>
          </div>

          {/* Store Guarantee/Policies from yumilk_fe design */}
          <div className="detail-policy-box">
            <div className="policy-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="policy-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Cam kết 100% sách chính hãng bản đẹp</span>
            </div>
            <div className="policy-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="policy-icon">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Đổi trả hàng miễn phí trong vòng 7 ngày nếu lỗi sản xuất</span>
            </div>
            <div className="policy-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="policy-icon">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Đồng kiểm thoải mái khi nhận hàng, ship nhanh hỏa tốc</span>
            </div>
          </div>

          {!isBuying && (
            <div className="detail-action-buttons">
              <button 
                className="btn-primary btn-detail-buy"
                onClick={() => setIsBuying(true)}
              >
                Mua Ngay
              </button>
              <button 
                className="btn-detail-cart" 
                onClick={() => {
                  onAddToCart(book);
                  toast.success('Đã thêm sách vào giỏ hàng!');
                }}
                aria-label="Thêm vào giỏ hàng"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Buying Stepper Flow Card */}
      {isBuying && (
        <div className="purchase-flow-card">
          <div className="purchase-flow-title">
            <svg className="purchase-title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="purchase-title-text">Quy trình Mua Sách Trực Tuyến</span>
          </div>

          {/* Steps visualizer */}
          <div className="purchase-steps">
            <div className={`purchase-step-item ${purchaseStep === 1 ? 'active' : ''} ${purchaseStep > 1 ? 'completed' : ''}`}>
              <div className="purchase-step-num">{purchaseStep > 1 ? '✓' : '1'}</div>
              <span className="purchase-step-label">Thông tin nhận hàng</span>
            </div>
            <div className={`purchase-step-item ${purchaseStep === 2 ? 'active' : ''} ${purchaseStep > 2 ? 'completed' : ''}`}>
              <div className="purchase-step-num">{purchaseStep > 2 ? '✓' : '2'}</div>
              <span className="purchase-step-label">Xác nhận thanh toán</span>
            </div>
            <div className={`purchase-step-item ${purchaseStep === 3 ? 'completed' : ''}`}>
              <div className="purchase-step-num">3</div>
              <span className="purchase-step-label">Hoàn tất</span>
            </div>
          </div>

          {/* Step 1: Info input (form-less) */}
          {purchaseStep === 1 && (
            <div className="purchase-step-content">
              <div className="purchase-input-grid">
                <div className="purchase-input-group">
                  <span className="profile-field-label">Tên người nhận</span>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nhập tên người nhận..."
                  />
                </div>
                <div className="purchase-input-group">
                  <span className="profile-field-label">Số điện thoại</span>
                  <input
                    type="tel"
                    className="profile-field-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
              </div>

              {/* Address selection mode */}
              <div className="address-type-selector">
                <button 
                  className={`address-type-btn ${addressType === 'default' ? 'active' : ''}`}
                  onClick={() => setAddressType('default')}
                  type="button"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Địa chỉ mặc định</span>
                </button>
                <button 
                  className={`address-type-btn ${addressType === 'custom' ? 'active' : ''}`}
                  onClick={() => setAddressType('custom')}
                  type="button"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <span>Nhập địa chỉ mới (Chi tiết)</span>
                </button>
              </div>

              {addressType === 'default' ? (
                <div className="default-address-display">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)', flexShrink: 0}}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh</span>
                </div>
              ) : (
                <div className="purchase-input-grid detailed-address-grid">
                  <div className="purchase-input-group">
                    <span className="profile-field-label">Tỉnh / Thành phố</span>
                    <select 
                      className="profile-field-input select-input"
                      value={province}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        setProvince(newProv);
                        // Reset district & ward
                        const firstDist = Object.keys(GHN_MOCK_DATA[newProv])[0];
                        setDistrict(firstDist);
                        setWard(GHN_MOCK_DATA[newProv][firstDist][0]);
                      }}
                    >
                      {Object.keys(GHN_MOCK_DATA).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="purchase-input-group">
                    <span className="profile-field-label">Quận / Huyện</span>
                    <select 
                      className="profile-field-input select-input"
                      value={district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setDistrict(newDist);
                        // Reset ward
                        setWard(GHN_MOCK_DATA[province][newDist][0]);
                      }}
                    >
                      {Object.keys(GHN_MOCK_DATA[province]).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="purchase-input-group">
                    <span className="profile-field-label">Phường / Xã</span>
                    <select 
                      className="profile-field-input select-input"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                    >
                      {GHN_MOCK_DATA[province][district].map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div className="purchase-input-group full-width">
                    <span className="profile-field-label">Số nhà, tên đường</span>
                    <input
                      type="text"
                      className="profile-field-input"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Nhập số nhà, tên đường cụ thể..."
                    />
                  </div>
                </div>
              )}

              <div className="profile-actions">
                <button className="btn-secondary" onClick={handleCancelPurchase}>Hủy bỏ</button>
                <button className="btn-primary" onClick={handleNextStep} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 24px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment details */}
          {purchaseStep === 2 && (
            <div className="purchase-step-content">
              <div className="purchase-summary-list">
                <div className="purchase-summary-row">
                  <span>Sách đã chọn:</span>
                  <strong>{book.title}</strong>
                </div>
                <div className="purchase-summary-row">
                  <span>Người nhận hàng:</span>
                  <span>{recipientName} ({phone})</span>
                </div>
                <div className="purchase-summary-row">
                  <span>Địa chỉ giao hàng:</span>
                  <span>{address}</span>
                </div>
                <div className="purchase-summary-row total">
                  <span>Thanh toán:</span>
                  <span className="price">{book.price}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="payment-method-selector">
                <span className="payment-method-title">Chọn hình thức thanh toán</span>
                <div className="payment-method-options">
                  <button 
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="6" y1="12" x2="6.01" y2="12"></line>
                      <line x1="18" y1="12" x2="18.01" y2="12"></line>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'payos' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('payos')}
                  >
                    <img src="/payos.svg" alt="PayOS" />
                  </button>
                  <button 
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'vnpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                  >
                    <img src="/vnpay.png" alt="VNPay" />
                  </button>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn-secondary" onClick={() => setPurchaseStep(1)}>Quay lại</button>
                <button className="btn-primary" onClick={handleConfirmPurchase} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 24px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success view */}
          {purchaseStep === 3 && (
            <div className="purchase-success-view">
              <div className="success-icon-circle">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 className="success-title">Đặt Hàng Thành Công!</h3>
              <p className="success-desc">
                {paymentMethod === 'cash' ? (
                  <>
                    Cảm ơn bạn đã mua sách tại InkPulse Bookstore. Đơn hàng của bạn sẽ được chuyển đi trong 24 giờ tới tới địa chỉ <strong>{address}</strong>. Vui lòng chuẩn bị số tiền <strong>{book.price}</strong> để thanh toán bằng tiền mặt khi nhận hàng.
                  </>
                ) : (
                  <>
                    Cảm ơn bạn đã đặt mua sách tại InkPulse Bookstore. Giao dịch thanh toán trực tuyến qua <strong>{paymentMethod === 'payos' ? 'PayOS' : 'VNPay'}</strong> đã được bắt đầu. Sau khi thanh toán thành công trên tab mới mở, đơn hàng của bạn sẽ được chuyển tới <strong>{address}</strong>.
                  </>
                )}
              </p>
              <button className="btn-primary" onClick={handleCancelPurchase} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 24px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Section: Tabs for Intro & Specs */}
      <div className="detail-bottom-tabs-section">
        {/* Tab Headers */}
        <div className="detail-tabs-header">
          <button 
            type="button"
            className={`detail-tab-btn ${activeTab === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            Giới thiệu sách
          </button>
          <button 
            type="button"
            className={`detail-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Thông tin chi tiết
          </button>
        </div>

        {/* Tab Content */}
        <div className="detail-tab-content">
          {activeTab === 'intro' ? (
            <div className="detail-bottom-intro">
              <div className="detail-long-desc">
                <p>{book.desc}</p>
                <p>
                  Cuốn sách này cung cấp những kiến thức thực tế và các mẫu thiết kế (design patterns) chuẩn mực nhất giúp nhà phát triển giải quyết triệt để các bài toán thường gặp trong quá trình xây dựng hệ thống phần mềm quy mô lớn. Với các ví dụ minh họa trực quan, dễ hiểu và đi thẳng vào bản chất vấn đề.
                </p>
              </div>
            </div>
          ) : (
            <div className="detail-bottom-specs">
              <table className="specs-table-full">
                <tbody>
                  {book.attributes ? (
                    Object.entries(book.attributes).map(([key, value]) => (
                      <tr key={key}>
                        <td className="specs-label">{key}</td>
                        <td className="specs-value">{value}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="specs-label">Ngôn ngữ</td>
                        <td className="specs-value">Tiếng Việt</td>
                      </tr>
                      <tr>
                        <td className="specs-label">Hình thức</td>
                        <td className="specs-value">Bìa Cứng</td>
                      </tr>
                      <tr>
                        <td className="specs-label">Kích thước</td>
                        <td className="specs-value">16 x 24 cm</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
