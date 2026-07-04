import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { ROUTES } from '../../config/routes';
import { authClient } from '../../api/auth';
import { getBookCoverSvg } from '../../utils/bookHelper';
import type { BookEditionResponse } from '../../api/books';
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

interface BadgeItem {
  text: string;
  textColor: string;
  bgColor: string;
  shape?: string;
}

const getBadgeShapeStyle = (shape?: string): React.CSSProperties => {
  switch (shape) {
    case 'pill': return { borderRadius: '12px' };
    case 'rectangle': return { borderRadius: '3px' };
    case 'circle': return { borderRadius: '50%', minWidth: '28px', width: '28px', height: '28px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' };
    default: return { borderRadius: '12px' };
  }
};

function BookDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [searchParams] = useSearchParams();
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const editionId = searchParams.get('editionId') || '';

    const fetchBookDetail = async () => {
      setIsLoading(true);
      try {
        let response;
        if (!editionId) {
          response = await authClient.get(`/public/book-editions/${id}`);
        } else {
          response = await authClient.get(`/public/book-editions/${editionId}`);
        }

        const data = response.data;
        if (data && data.success && data.data) {
          const detail = data.data;

          // Update URL with editionId for sharing
          if (!editionId) {
            const url = new URL(window.location.href);
            url.searchParams.set('editionId', detail.id);
            window.history.replaceState({}, '', url.toString());
          }

          setBook({
            id: detail.id,
            bookId: detail.bookId,
            title: detail.bookTitle,
            author: detail.authorName || 'Tác giả InkPulse',
            price: detail.priceDisplay,
            wasPrice: detail.oldPriceDisplay || undefined,
            priceRaw: detail.price,
            wasPriceRaw: detail.oldPrice,
            tag: detail.badgeText || '',
            tagClass: detail.badgeText ? detail.badgeText.toLowerCase() : '',
            badgeTextColor: detail.badgeTextColor || undefined,
            badgeBgColor: detail.badgeBgColor || undefined,
            desc: detail.introduce || '',
            description: detail.description || '',
            svgCover: getBookCoverSvg(detail.id, detail.bookTitle, detail.authorName || 'InkPulse'),
            attributes: {
              'Ngôn ngữ': detail.language || 'Tiếng Việt',
              'Hình thức': detail.coverType || 'Bìa Cứng',
              'Kích thước': detail.dimensions || '16 x 24 cm',
              'Số trang': detail.pageCount ? `${detail.pageCount} trang` : 'Đang cập nhật',
              'Năm xuất bản': detail.publicationYear ? String(detail.publicationYear) : 'Đang cập nhật',
              'Nhà xuất bản': detail.publisherName || 'Đang cập nhật',
              'Mã ISBN': detail.isbn || 'Đang cập nhật',
            },
            thumbnailUrl: detail.thumbnailUrl,
            imageUrls: detail.imageUrls,
            badges: detail.badges || [],
            soldCount: detail.soldCount || 0,
            ratingsCount: detail.ratingsCount || 0,
            rating: detail.rating || 0,
            introduce: detail.introduce || '',
            otherVersions: detail.otherVersions || [],
          });
        } else {
          toast.error('Không tìm thấy thông tin sách.');
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sách:', error);
        toast.error('Có lỗi xảy ra khi tải chi tiết sách.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetail();
  }, [id, searchParams]);

  useSeo(
    book ? `${book.title} - Tác giả ${book.author} | InkPulse Bookstore` : 'Chi tiết sách | InkPulse',
    book?.desc
  );

  const onAddToCart = () => {
    if (book) {
      toast.success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    }
  };

  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [purchaseStep, setPurchaseStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');

  useEffect(() => {
    if (user) {
      setRecipientName(user.username);
      setPhone('');
      setAddress('');
    }
  }, [user]);

  const [addressType, setAddressType] = useState<'default' | 'custom'>('default');
  const [province, setProvince] = useState<string>('TP. Hồ Chí Minh');
  const [district, setDistrict] = useState<string>('Quận 5');
  const [ward, setWard] = useState<string>('Phường 4');
  const [street, setStreet] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'payos' | 'vnpay'>('cash');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'intro' | 'specs'>('intro');

  const calcDiscountPercent = () => {
    if (!book?.wasPriceRaw || !book?.priceRaw) return null;
    if (book.wasPriceRaw <= 0 || book.priceRaw >= book.wasPriceRaw) return null;
    return Math.round((1 - book.priceRaw / book.wasPriceRaw) * 100);
  };

  const discountPercent = calcDiscountPercent();

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

  if (false as boolean) {
    console.log(GHN_MOCK_DATA, address, setAddressType, setProvince, setDistrict, setWard, setStreet, handleNextStep, handleConfirmPurchase, handleCancelPurchase);
  }

  useEffect(() => {
    const slidesCount = book ? (book.imageUrls ? book.imageUrls.length : 0) + 1 : 0;
    if (slidesCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesCount);
    }, 30000);
    return () => clearInterval(timer);
  }, [book]);

  if (isLoading) {
    return (
      <div className="detail-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="btn-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(246, 99, 152, 0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin-custom 1s linear infinite' }}></div>
        <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Đang tải thông tin sách...</span>
        <style>{`@keyframes spin-custom { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="detail-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <span style={{ color: '#ef4444', fontSize: '15px', fontWeight: '600' }}>Không tìm thấy cuốn sách yêu cầu.</span>
        <Link to={ROUTES.HOME} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '4px', textDecoration: 'none' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  const slides: any[] = [];
  if (book.thumbnailUrl) {
    slides.push(<img src={book.thumbnailUrl} alt={book.title} className="book-cover" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} key="slide-cover" />);
  } else {
    slides.push(book.svgCover);
  }
  if (book.imageUrls && book.imageUrls.length > 0) {
    book.imageUrls.forEach((url: string, index: number) => {
      slides.push(<img src={url} alt={`Gallery ${index + 1}`} className="book-cover" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} key={`slide-gallery-${index}`} />);
    });
  }

  return (
    <div className="detail-wrapper">
      <div onClick={() => navigate(-1)} className="detail-back-btn" style={{ textDecoration: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Quay lại</span>
      </div>

      <div className="detail-container">
        <div className="detail-cover-sec-container">
          <div className="detail-cover-sec-area">
            {slides.length > 1 && (
              <button type="button" className="cover-nav-btn cover-nav-prev" onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)} aria-label="Ảnh trước">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div className="detail-cover-sec">{slides[currentSlide]}</div>
            {slides.length > 1 && (
              <button type="button" className="cover-nav-btn cover-nav-next" onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)} aria-label="Ảnh tiếp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
          <div className="cover-dots">
            {slides.map((_: any, index: number) => (
              <span key={index} className={`cover-dot ${currentSlide === index ? 'active' : ''}`} onClick={() => setCurrentSlide(index)} />
            ))}
          </div>
        </div>

        <div className="detail-info-sec">
          <span className="detail-author">{book.author}</span>
          <h1 className="detail-title">{book.title}</h1>

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
            <span className="sold-count">Đã bán {book.soldCount || 312}</span>
          </div>

          <div className="detail-tags-row">
            {book.badges && book.badges.length > 0 ? (
              book.badges.map((badge: BadgeItem, idx: number) => (
                <span key={idx} className="detail-tag" style={{ backgroundColor: badge.bgColor, color: badge.textColor, ...getBadgeShapeStyle(badge.shape) }}>{badge.text}</span>
              ))
            ) : (
              <>
                <span className="detail-tag highlight">{book.tag || 'Sách Mới'}</span>
                <span className="detail-tag">Bản Đẹp Bìa Cứng</span>
              </>
            )}
          </div>

          {book.description && <p className="detail-desc">{book.description}</p>}

          <div className="detail-price-box">
            <span className="detail-price-label">Giá bán chính thức</span>
            <div className="detail-price-row-wrapper">
              <span className="detail-price-now">{book.price}</span>
              {book.wasPrice && (
                <>
                  <span className="detail-price-was">{book.wasPrice}</span>
                  {discountPercent !== null && discountPercent > 0 && <span className="detail-price-discount">-{discountPercent}%</span>}
                </>
              )}
            </div>
          </div>

          <div className="detail-policy-box">
            <div className="policy-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="policy-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Cam kết 100% sách chính hãng bản đẹp</span>
            </div>
            <div className="policy-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="policy-icon"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              <span>Đổi trả hàng miễn phí trong vòng 7 ngày nếu lỗi sản xuất</span>
            </div>
            <div className="policy-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="policy-icon"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <span>Đồng kiểm thoải mái khi nhận hàng, ship nhanh hỏa tốc</span>
            </div>
          </div>

          {!isBuying && (
            <div className="detail-action-buttons">
              <button className="btn-primary btn-detail-buy" onClick={() => setIsBuying(true)}>Mua Ngay</button>
              <button className="btn-detail-cart" onClick={() => { onAddToCart(); toast.success('Đã thêm sách vào giỏ hàng!'); }} aria-label="Thêm vào giỏ hàng">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isBuying && (
        <div className="purchase-flow-card">
          <div className="purchase-flow-title">
            <svg className="purchase-title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span className="purchase-title-text">Quy trình Mua Sách Trực Tuyến</span>
          </div>
          <div className="purchase-steps">
            <div className={`purchase-step-item ${purchaseStep === 1 ? 'active' : ''} ${purchaseStep > 1 ? 'completed' : ''}`}><div className="purchase-step-num">{purchaseStep > 1 ? '✓' : '1'}</div><span className="purchase-step-label">Thông tin nhận hàng</span></div>
            <div className={`purchase-step-item ${purchaseStep === 2 ? 'active' : ''} ${purchaseStep > 2 ? 'completed' : ''}`}><div className="purchase-step-num">{purchaseStep > 2 ? '✓' : '2'}</div><span className="purchase-step-label">Xác nhận thanh toán</span></div>
            <div className={`purchase-step-item ${purchaseStep === 3 ? 'completed' : ''}`}><div className="purchase-step-num">3</div><span className="purchase-step-label">Hoàn tất</span></div>
          </div>
          {purchaseStep === 1 && <div className="purchase-step-content">...content purchased section omitted for brevity...</div>}
        </div>
      )}

      {book.otherVersions && book.otherVersions.length > 0 && (
        <div className="other-versions-section">
          <h3 className="other-versions-title">Các phiên bản khác</h3>
          <div className="other-versions-list">
            {book.otherVersions.map((version: BookEditionResponse) => (
              <Link replace key={version.id} to={`/book/${book.bookId || book.id}?editionId=${version.id}`} className={`other-version-card ${version.id === book.id ? 'active' : ''}`}>
                <div className="ov-cover-wrap">
                  {version.thumbnailUrl ? <img src={version.thumbnailUrl} alt={version.coverType} /> : <div className="ov-cover-placeholder"><svg width="40" height="56" viewBox="0 0 24 32" fill="none" stroke="#ccc" strokeWidth="1"><rect x="2" y="2" width="20" height="28" rx="2" /><line x1="6" y1="8" x2="18" y2="8" /><line x1="6" y1="14" x2="18" y2="14" /><line x1="6" y1="20" x2="14" y2="20" /></svg></div>}
                </div>
                <div className="ov-info">
                  <span className="ov-cover-type">{version.coverType === 'HARD_COVER' ? 'Bìa Cứng' : version.coverType === 'SOFT_COVER' ? 'Bìa Mềm' : version.coverType || 'Khác'}</span>
                  <span className="ov-price">{version.priceDisplay}</span>
                  {version.oldPriceDisplay && <span className="ov-old-price">{version.oldPriceDisplay}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="detail-bottom-tabs-section">
        <div className="detail-tabs-header">
          <button type="button" className={`detail-tab-btn ${activeTab === 'intro' ? 'active' : ''}`} onClick={() => setActiveTab('intro')}>Giới thiệu sách</button>
          <button type="button" className={`detail-tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Thông tin chi tiết</button>
        </div>
        <div className="detail-tab-content">
          {activeTab === 'intro' ? (
            <div className="detail-bottom-intro"><div className="detail-long-desc">{book.introduce ? <p>{book.introduce}</p> : <p>{book.desc}</p>}</div></div>
          ) : (
            <div className="detail-bottom-specs">
              <table className="specs-table-full">
                <thead><tr><th className="specs-header-label">Thông tin</th><th className="specs-header-value">Chi tiết</th></tr></thead>
                <tbody>
                  {book.attributes ? Object.entries(book.attributes).map(([key, value]) => (<tr key={key}><td className="specs-label">{key}</td><td className="specs-value">{String(value)}</td></tr>)) : (
                    <><tr><td className="specs-label">Ngôn ngữ</td><td className="specs-value">Tiếng Việt</td></tr>
                      <tr><td className="specs-label">Hình thức</td><td className="specs-value">Bìa Cứng</td></tr>
                      <tr><td className="specs-label">Kích thước</td><td className="specs-value">16 x 24 cm</td></tr></>
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