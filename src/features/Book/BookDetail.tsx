import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { ROUTES } from '../../config/routes';
import { authClient, getUserProfileApi } from '../../api/auth';
import { getProvincesApi, getDistrictsApi, getWardsApi } from '../../api/address';
import { calculateShippingFeeApi, createOrderApi, getOrderDetailApi, mockPaymentApi } from '../../api/order';
import { addToCartApi } from '../../api/cart';
import { getBookCoverSvg } from '../../utils/bookHelper';
import type { BookEditionResponse } from '../../api/books';
import './BookDetail.css';

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
  const { user, setCartCount } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [searchParams] = useSearchParams();
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

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
              'Kích thước': (detail.widthCm && detail.heightCm && detail.lengthCm)
                ? `${detail.widthCm} × ${detail.lengthCm} × ${detail.heightCm} cm`
                : 'Đang cập nhật',
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
            stockQuantity: detail.stockQuantity || 0,
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

  const onAddToCart = async () => {
    if (!book) return;

    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm sách vào giỏ hàng.');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (quantity <= 0) {
      toast.error('Số lượng không hợp lệ.');
      return;
    }

    if (quantity > book.stockQuantity) {
      toast.error(`Số lượng chọn vượt quá tồn kho. Tối đa còn lại: ${book.stockQuantity} cuốn.`);
      return;
    }

    setIsAddingToCart(true);
    try {
      const res = await addToCartApi(book.id, quantity);
      if (res.data.success) {
        toast.success(res.data.message || `Đã thêm ${quantity} cuốn vào giỏ hàng!`);
        if (typeof res.data.data.cartTotalItems === 'number') {
          setCartCount(res.data.data.cartTotalItems);
        }
      } else {
        toast.error(res.data.message || 'Thêm vào giỏ hàng thất bại.');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState<boolean>(false);

  // New address states
  const [newLabel, setNewLabel] = useState<string>('Nhà riêng');
  const [newReceiverName, setNewReceiverName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newStreet, setNewStreet] = useState<string>('');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  const [showProvinceDropdown, setShowProvinceDropdown] = useState<boolean>(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState<boolean>(false);
  const [showWardDropdown, setShowWardDropdown] = useState<boolean>(false);

  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);

  const [showAddressDropdown, setShowAddressDropdown] = useState<boolean>(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  // Shipping & Billing
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PAYOS'>('COD');

  // Checkout results
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    orderCode: string;
    checkoutUrl: string | null;
    qrCode?: string | null;
    expiredAt?: number | null;
  } | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'intro' | 'specs'>('intro');

  // Click outside select dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(e.target as Node)) {
        setShowWardDropdown(false);
      }
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target as Node)) {
        setShowAddressDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Load profiles and addresses
  useEffect(() => {
    if (isBuying && user) {
      const fetchProfile = async () => {
        try {
          const res = await getUserProfileApi();
          const addr = res.data?.data?.addresses || [];
          setSavedAddresses(addr);
          if (addr.length > 0) {
            setSelectedAddressId(addr[0].id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
          const profileData = res.data?.data;
          if (profileData) {
            const fName = profileData.firstName || '';
            const lName = profileData.lastName || '';
            const fullName = `${fName} ${lName}`.trim() || user.username || '';
            setNewReceiverName(fullName);
          }
        } catch (err) {
          console.error('Lỗi khi tải địa chỉ:', err);
        }
      };
      
      const fetchProvinces = async () => {
        try {
          const res = await getProvincesApi();
          setProvinces(res.data?.data || []);
        } catch (err) {
          console.error('Lỗi khi tải tỉnh/thành:', err);
        }
      };

      setNewReceiverName(user.username || '');
      fetchProfile();
      fetchProvinces();
    }
  }, [isBuying, user]);

  const handleProvinceChange = async (provId: number) => {
    setSelectedProvinceId(provId);
    setSelectedDistrictId(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);
    setShippingFee(null);
    if (!provId) return;
    try {
      const res = await getDistrictsApi(provId);
      setDistricts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách quận huyện.');
    }
  };

  const handleDistrictChange = async (distId: number) => {
    setSelectedDistrictId(distId);
    setSelectedWardCode(null);
    setWards([]);
    setShippingFee(null);
    if (!distId) return;
    try {
      const res = await getWardsApi(distId);
      setWards(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách phường xã.');
    }
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWardCode(wardCode);
    setShippingFee(null);
  };

  // Calculate shipping fee automatically
  useEffect(() => {
    if (!isBuying || !book) return;

    const calculateFee = async () => {
      if (useNewAddress) {
        if (!selectedDistrictId || !selectedWardCode) {
          setShippingFee(null);
          return;
        }
        setIsCalculatingFee(true);
        try {
          const res = await calculateShippingFeeApi({
            toDistrictId: selectedDistrictId,
            toWardCode: selectedWardCode,
            items: [{ editionId: book.id, quantity }]
          });
          if (res.data?.success) {
            setShippingFee(res.data.data.total);
          } else {
            setShippingFee(null);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsCalculatingFee(false);
        }
      } else {
        const addr = savedAddresses.find(a => a.id === selectedAddressId);
        console.log('calculateFee saved address found:', addr, 'selectedAddressId:', selectedAddressId);
        if (!addr || !addr.districtId || !addr.wardCode) {
          console.warn('calculateFee check failed, missing fields. addr:', addr);
          setShippingFee(null);
          return;
        }
        setIsCalculatingFee(true);
        try {
          const payload = {
            toDistrictId: addr.districtId,
            toWardCode: addr.wardCode,
            items: [{ editionId: book.id, quantity }]
          };
          console.log('calculateFee sending API request with payload:', payload);
          const res = await calculateShippingFeeApi(payload);
          console.log('calculateFee API response:', res.data);
          if (res.data?.success) {
            setShippingFee(res.data.data.total);
          } else {
            setShippingFee(null);
          }
        } catch (err) {
          console.error('calculateFee API error:', err);
          setShippingFee(null);
        } finally {
          setIsCalculatingFee(false);
        }
      }
    };

    calculateFee();
  }, [useNewAddress, selectedAddressId, selectedDistrictId, selectedWardCode, quantity, book, isBuying, savedAddresses]);

  const handlePlaceOrder = async () => {
    if (!book || !user) return;

    if (shippingFee === null) {
      toast.error('Vui lòng hoàn thành địa chỉ giao hàng để tính phí vận chuyển.');
      return;
    }

    const payload: any = {
      paymentMethod,
      items: [{ editionId: book.id, quantity }]
    };

    if (useNewAddress) {
      if (!newReceiverName.trim() || !newPhone.trim() || !newStreet.trim() || !selectedProvinceId || !selectedDistrictId || !selectedWardCode) {
        toast.error('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
      }
      payload.provinceId = selectedProvinceId;
      payload.districtId = selectedDistrictId;
      payload.wardCode = selectedWardCode;
      payload.streetAddress = newStreet.trim();
      payload.recipientPhone = newPhone.trim();
      payload.receiverName = newReceiverName.trim();
      payload.addressLabel = newLabel.trim() || 'Nhà riêng';
    } else {
      if (!selectedAddressId) {
        toast.error('Vui lòng chọn địa chỉ giao hàng.');
        return;
      }
      payload.addressId = selectedAddressId;
    }

    setIsPlacingOrder(true);
    try {
      const res = await createOrderApi(payload);
      if (res.data?.success) {
        const orderData = res.data.data;
        toast.success(res.data.message || 'Đặt đơn hàng thành công!');

        setOrderResult({
          orderId: orderData.orderId,
          orderCode: orderData.orderCode,
          checkoutUrl: orderData.checkoutUrl,
          qrCode: orderData.qrCode
        });

        if (paymentMethod === 'PAYOS' && orderData.checkoutUrl) {
          setIsPolling(true);
        } else {
          setPaymentSuccess(true);
        }
      } else {
        toast.error(res.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // PayOS Polling
  useEffect(() => {
    if (!isPolling || !orderResult?.orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await getOrderDetailApi(orderResult.orderId);
        if (res.data?.success) {
          const detail = res.data.data;
          if (detail.paymentStatus === 'COMPLETED') {
            setPaymentSuccess(true);
            setIsPolling(false);
            toast.success('Thanh toán đơn hàng thành công!');
            clearInterval(interval);
          } else if (detail.orderStatus === 'CANCELLED') {
            toast.error('Đơn hàng đã bị hủy.');
            setIsPolling(false);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPolling, orderResult]);

  // PayOS Expiration Timer
  useEffect(() => {
    if (orderResult?.expiredAt) {
      const calculateTimeLeft = () => {
        const now = Math.floor(Date.now() / 1000);
        const difference = orderResult.expiredAt - now;
        return difference > 0 ? difference : 0;
      };

      setTimeLeft(calculateTimeLeft());

      const timer = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setIsPolling(false);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [orderResult]);

  const handleCancelPurchase = () => {
    setIsBuying(false);
    setShippingFee(null);
    setOrderResult(null);
    setIsPolling(false);
    setPaymentSuccess(false);
    setTimeLeft(null);
    setUseNewAddress(false);
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedWardCode(null);
    setNewStreet('');
    setNewPhone('');
    setNewLabel('Nhà riêng');
  };

  const calcDiscountPercent = () => {
    if (!book?.wasPriceRaw || !book?.priceRaw) return null;
    if (book.wasPriceRaw <= 0 || book.priceRaw >= book.wasPriceRaw) return null;
    return Math.round((1 - book.priceRaw / book.wasPriceRaw) * 100);
  };

  const discountPercent = calcDiscountPercent();



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
            {book.stockQuantity <= 0 && (
              <div className="detail-stock-status" style={{ marginTop: '8px' }}>
                <span className="stock-badge stock-empty">Tạm hết hàng</span>
              </div>
            )}
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

          {book.stockQuantity > 0 && !isBuying && (
            <div className="quantity-selector-container">
              <span className="quantity-label">Số lượng:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn" 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isAddingToCart}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    className={`qty-input ${quantity > book.stockQuantity ? 'qty-error' : ''}`}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val <= 0) {
                        setQuantity(1);
                      } else {
                        setQuantity(val);
                      }
                    }}
                    disabled={isAddingToCart}
                  />
                  <button 
                    className="qty-btn" 
                    onClick={() => setQuantity(q => q + 1)}
                    disabled={quantity >= book.stockQuantity || isAddingToCart}
                  >
                    +
                  </button>
                </div>
                
                <span className={`stock-badge ${book.stockQuantity <= 5 ? 'stock-low' : 'stock-ok'}`} style={{ marginTop: '0', fontSize: '13px' }}>
                  {book.stockQuantity <= 5 ? `Chỉ còn ${book.stockQuantity} cuốn` : `${book.stockQuantity} cuốn có sẵn`}
                </span>
              </div>
              {quantity > book.stockQuantity && (
                <span className="qty-error-msg" style={{ display: 'block', marginTop: '8px' }}>Vượt quá số lượng tồn kho! (Tối đa: {book.stockQuantity})</span>
              )}
            </div>
          )}

          {!isBuying && (
            <div className="detail-action-buttons">
              {book.stockQuantity > 0 ? (
                <>
                  <button 
                    className="btn-primary btn-detail-buy" 
                    onClick={() => setIsBuying(true)}
                    disabled={isAddingToCart || quantity > book.stockQuantity}
                  >
                    Mua Ngay
                  </button>
                  <button 
                    className="btn-detail-cart" 
                    onClick={onAddToCart} 
                    disabled={isAddingToCart || quantity > book.stockQuantity}
                    aria-label="Thêm vào giỏ hàng"
                  >
                    {isAddingToCart ? (
                      '...'
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    )}
                  </button>
                </>
              ) : (
                <button className="btn-primary btn-detail-buy" disabled style={{ opacity: 0.6, background: '#9ca3af', border: 'none', cursor: 'not-allowed' }}>
                  Hết Hàng
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isBuying && (
        <div className="checkout-section">
          <h2 className="checkout-title">Thông tin thanh toán & Giao hàng</h2>

          {!orderResult ? (
            <div className="checkout-grid">
              {/* Address Selection Section */}
              <div>
                <h3 className="checkout-subtitle">Địa chỉ giao nhận</h3>
                {savedAddresses.length > 0 && !useNewAddress ? (
                  <div style={{ marginBottom: '16px', animation: 'fadeIn 0.2s ease' }}>
                    <div className="profile-field-group" ref={addressDropdownRef} style={{ position: 'relative' }}>
                      <div
                        className="custom-select-trigger"
                        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                        style={{
                          height: 'auto',
                          minHeight: '42px',
                          padding: '10px 40px 10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative'
                        }}
                      >
                        {(() => {
                          const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
                          if (!selectedAddr) return <span>Chọn địa chỉ...</span>;
                          return (
                            <div style={{ textAlign: 'left', fontSize: '13.5px', lineHeight: '1.4', paddingRight: '8px' }}>
                              <strong>{selectedAddr.addressLabel || 'Địa chỉ'}</strong>
                              <span style={{ color: 'var(--text-light)', margin: '0 8px' }}>|</span>
                              <span>SĐT: <span style={{ color: '#2563eb', fontWeight: '600' }}>{selectedAddr.recipientPhone}</span></span>
                              <br />
                              <span style={{ color: '#16a34a', fontWeight: '500', fontSize: '12.5px' }}>
                                {selectedAddr.streetAddress}, {selectedAddr.wardName}, {selectedAddr.districtName}, {selectedAddr.provinceName}
                              </span>
                            </div>
                          );
                        })()}
                        <svg
                          className={`chevron-icon ${showAddressDropdown ? 'open' : ''}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          style={{ position: 'absolute', right: '14px', top: '50%', transform: showAddressDropdown ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', transition: 'transform 0.2s ease' }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>

                      {showAddressDropdown && (
                        <div className="custom-select-dropdown" style={{ maxHeight: '250px', overflowY: 'auto', zIndex: 999 }}>
                          {savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={`custom-select-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setShowAddressDropdown(false);
                              }}
                              style={{
                                padding: '12px 14px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '4px',
                                textAlign: 'left'
                              }}
                            >
                              <div style={{ fontWeight: '700', fontSize: '13.5px', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                <span>{addr.addressLabel || 'Địa chỉ'}</span>
                                {selectedAddressId === addr.id && (
                                  <span style={{ color: 'var(--primary)', fontSize: '12px' }}>✓ Đang chọn</span>
                                )}
                              </div>
                              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                <p style={{ margin: '0 0 2px 0' }}>SĐT: <strong style={{ color: '#2563eb' }}>{addr.recipientPhone}</strong></p>
                                <p style={{ margin: '0', color: '#16a34a', fontWeight: '500' }}>{addr.streetAddress}, {addr.wardName}, {addr.districtName}, {addr.provinceName}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-view-details"
                      onClick={() => setUseNewAddress(true)}
                      style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}
                    >
                      + Sử dụng địa chỉ khác
                    </button>
                  </div>
                ) : (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Nhập địa chỉ nhận hàng mới</h4>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => setUseNewAddress(false)}
                          style={{ fontSize: '13px' }}
                        >
                          Chọn địa chỉ có sẵn
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="profile-field-group">
                        <span className="profile-field-label">Tên người nhận</span>
                        <input
                          type="text"
                          className="profile-field-input"
                          value={newReceiverName}
                          disabled
                          placeholder="Họ và tên..."
                          style={{ cursor: 'not-allowed' }}
                        />
                      </div>
                      <div className="profile-field-group">
                        <span className="profile-field-label">Số điện thoại</span>
                        <input
                          type="text"
                          className="profile-field-input"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Số điện thoại..."
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      {/* Province Cascade Select */}
                      <div className="profile-field-group" ref={provinceDropdownRef} style={{ position: 'relative' }}>
                        <span className="profile-field-label">Tỉnh / Thành</span>
                        <div
                          className="custom-select-trigger"
                          onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                        >
                          <span className="selected-value-text">
                            {provinces.find(p => p.provinceId === selectedProvinceId)?.provinceName || 'Chọn Tỉnh/Thành'}
                          </span>
                          <svg className={`chevron-icon ${showProvinceDropdown ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                        {showProvinceDropdown && (
                          <div className="custom-select-dropdown">
                            {provinces.map(p => (
                              <div
                                key={p.provinceId}
                                className={`custom-select-option ${selectedProvinceId === p.provinceId ? 'selected' : ''}`}
                                onClick={() => {
                                  handleProvinceChange(p.provinceId);
                                  setShowProvinceDropdown(false);
                                }}
                              >
                                {p.provinceName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* District Cascade Select */}
                      <div className="profile-field-group" ref={districtDropdownRef} style={{ position: 'relative' }}>
                        <span className="profile-field-label">Quận / Huyện</span>
                        <div
                          className={`custom-select-trigger ${!selectedProvinceId ? 'disabled' : ''}`}
                          onClick={() => selectedProvinceId && setShowDistrictDropdown(!showDistrictDropdown)}
                          style={{ cursor: selectedProvinceId ? 'pointer' : 'not-allowed', opacity: selectedProvinceId ? 1 : 0.6 }}
                        >
                          <span className="selected-value-text">
                            {districts.find(d => d.districtId === selectedDistrictId)?.districtName || 'Chọn Quận/Huyện'}
                          </span>
                          <svg className={`chevron-icon ${showDistrictDropdown ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                        {showDistrictDropdown && selectedProvinceId && (
                          <div className="custom-select-dropdown">
                            {districts.map(d => (
                              <div
                                key={d.districtId}
                                className={`custom-select-option ${selectedDistrictId === d.districtId ? 'selected' : ''}`}
                                onClick={() => {
                                  handleDistrictChange(d.districtId);
                                  setShowDistrictDropdown(false);
                                }}
                              >
                                {d.districtName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ward Cascade Select */}
                      <div className="profile-field-group" ref={wardDropdownRef} style={{ position: 'relative' }}>
                        <span className="profile-field-label">Phường / Xã</span>
                        <div
                          className={`custom-select-trigger ${!selectedDistrictId ? 'disabled' : ''}`}
                          onClick={() => selectedDistrictId && setShowWardDropdown(!showWardDropdown)}
                          style={{ cursor: selectedDistrictId ? 'pointer' : 'not-allowed', opacity: selectedDistrictId ? 1 : 0.6 }}
                        >
                          <span className="selected-value-text">
                            {wards.find(w => w.wardCode === selectedWardCode)?.wardName || 'Chọn Phường/Xã'}
                          </span>
                          <svg className={`chevron-icon ${showWardDropdown ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                        {showWardDropdown && selectedDistrictId && (
                          <div className="custom-select-dropdown">
                            {wards.map(w => (
                              <div
                                key={w.wardCode}
                                className={`custom-select-option ${selectedWardCode === w.wardCode ? 'selected' : ''}`}
                                onClick={() => {
                                  handleWardChange(w.wardCode);
                                  setShowWardDropdown(false);
                                }}
                              >
                                {w.wardName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="profile-field-group">
                        <span className="profile-field-label">Địa chỉ chi tiết (số nhà, ngõ, đường...)</span>
                        <input
                          type="text"
                          className="profile-field-input"
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          placeholder="Địa chỉ chi tiết..."
                        />
                      </div>
                      <div className="profile-field-group">
                        <span className="profile-field-label">Nhãn</span>
                        <input
                          type="text"
                          className="profile-field-input"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="Nhà riêng, Cơ quan..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div>
                <h3 className="checkout-subtitle">Phương thức thanh toán</h3>
                <div className="payment-methods-grid">
                  <div
                    className={`payment-method-btn ${paymentMethod === 'COD' ? 'selected-cod' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
                      <path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" />
                    </svg>
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>

                  <div
                    className={`payment-method-btn payos-btn ${paymentMethod === 'PAYOS' ? 'selected-payos' : ''}`}
                    onClick={() => setPaymentMethod('PAYOS')}
                  >
                    <img src="/payos.svg" alt="PayOS Logo" height="38" style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />
                    <span style={{ fontSize: '13.5px' }}>Chuyển khoản / Quét mã QR</span>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown summary */}
              <div className="checkout-summary-box">
                <div className="summary-row">
                  <span>Tiền hàng ({quantity} cuốn)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{((book.priceRaw || 0) * quantity).toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển (GHN)</span>
                  <span style={{ color: '#2563eb', fontWeight: '700' }}>
                    {isCalculatingFee ? (
                      <span style={{ fontSize: '12.5px', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div className="spin-loader-pink" style={{ width: '12px', height: '12px', borderWidth: '2px' }} /> Đang tính...
                      </span>
                    ) : shippingFee !== null ? (
                      `${shippingFee.toLocaleString('vi-VN')} VNĐ`
                    ) : (
                      'Chọn địa chỉ để tính phí'
                    )}
                  </span>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng tiền thanh toán</span>
                  <span style={{ color: '#16a34a', fontSize: '18px', fontWeight: '800' }}>
                    {shippingFee !== null 
                      ? `${((book.priceRaw || 0) * quantity + shippingFee).toLocaleString('vi-VN')} VNĐ`
                      : `${((book.priceRaw || 0) * quantity).toLocaleString('vi-VN')} VNĐ`
                    }
                  </span>
                </div>
              </div>

              {/* Actions row */}
              <div className="checkout-actions-row">
                <button type="button" className="btn-checkout-cancel" onClick={handleCancelPurchase}>
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-checkout-submit"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || shippingFee === null}
                  style={{ position: 'relative' }}
                >
                  {isPlacingOrder && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spin-loader" style={{ borderTopColor: '#ffffff', width: '18px', height: '18px' }} />
                    </div>
                  )}
                  <span style={{ visibility: isPlacingOrder ? 'hidden' : 'visible' }}>Xác nhận đặt hàng</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center', padding: '16px' }}>
              {paymentMethod === 'PAYOS' && !paymentSuccess ? (
                <div className="payos-qr-box">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#00a85e' }}>Mã QR thanh toán PayOS</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Mở ứng dụng ngân hàng / ví điện tử quét mã QR dưới đây</p>
                  
                  {orderResult.checkoutUrl ? (
                    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '20px auto' }}>
                      <img
                        className="payos-qr-img"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(orderResult.qrCode || orderResult.checkoutUrl)}`}
                        alt="PayOS QR Code"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '12px',
                          opacity: timeLeft === 0 ? 0.15 : 1,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                      {timeLeft === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          fontWeight: '700',
                          fontSize: '18px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '12px'
                        }}>
                          Mã hết hạn
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Không tạo được link QR.</div>
                  )}

                  {timeLeft !== null && (
                    <div style={{
                      margin: '12px 0',
                      color: timeLeft === 0 ? '#ef4444' : 'var(--text-light)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {timeLeft === 0 ? (
                        <span>Mã thanh toán đã hết hạn</span>
                      ) : (
                        <span>Thời gian thanh toán còn lại: <strong style={{ color: 'var(--primary)' }}>{formatTime(timeLeft)}</strong></span>
                      )}
                    </div>
                  )}

                  <div className="payos-status-text" style={{ justifyContent: 'center', marginTop: '16px' }}>
                    {timeLeft !== 0 && <div className="spin-loader" />}
                    <span style={{ color: timeLeft === 0 ? '#ef4444' : 'inherit' }}>
                      {timeLeft === 0 ? 'Hết thời gian thanh toán' : 'Đang chờ xác nhận thanh toán tự động...'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13.5px', marginTop: '16px', color: 'var(--text-light)', borderTop: '1px solid var(--border-dark)', paddingTop: '12px' }}>
                    <p style={{ margin: '0 0 6px 0' }}>Mã giao dịch: <strong>#{orderResult.orderCode}</strong></p>
                    {orderResult.checkoutUrl && timeLeft !== 0 && (
                      <a
                        href={orderResult.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', marginBottom: '12px', color: '#00a85e', fontSize: '13px', fontWeight: '600', textDecoration: 'underline' }}
                      >
                        Nhấp vào đây để thanh toán trực tiếp qua link PayOS
                      </a>
                    )}
                    <button type="button" className="btn-checkout-cancel" style={{ width: '100%', marginTop: '6px' }} onClick={handleCancelPurchase}>
                      {timeLeft === 0 ? 'Đóng' : 'Hủy & Đóng'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '600px', margin: '40px auto', padding: '32px', border: 'none', backgroundColor: 'transparent', textAlign: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ marginBottom: '20px', display: 'inline-block' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3 style={{ color: '#22c55e', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font)' }}>Đặt đơn hàng thành công!</h3>
                  <p style={{ margin: '0 0 28px 0', fontSize: '16px', color: '#111827', lineHeight: '1.6' }}>
                    Đơn hàng mã số <strong style={{ color: 'var(--primary)', fontWeight: '700' }}>#{orderResult.orderCode}</strong> đã được hệ thống ghi nhận và chuẩn bị đóng gói vận chuyển.
                  </p>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      fontSize: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      transition: 'none',
                      margin: '0 auto'
                    }}
                    onClick={handleCancelPurchase}
                  >
                    ← Quay lại sách
                  </button>
                </div>
              )}
            </div>
          )}
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