import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getCartCountApi, getUserProfileApi } from '../../api/auth';
import { getMyCartApi, updateCartItemApi, removeCartItemApi } from '../../api/cart';
import type { CartItemResponse } from '../../api/cart';
import { ROUTES } from '../../config/routes';
import { getProvincesApi, getDistrictsApi, getWardsApi } from '../../api/address';
import { calculateShippingFeeApi, createOrderApi, getOrderDetailApi, mockPaymentApi } from '../../api/order';
import { getMyVouchersApi, checkVoucherEligibilityApi } from '../../api/vouchers';
import type { CheckoutEligibleVoucherResponse } from '../../api/vouchers';
import '../../pages/Vouchers.css';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();

  // Refs for closing dropdowns on outside click
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);

  // Cart state
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // tracks itemId being updated
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Checkout UI / flow states
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState<boolean>(false);

  // New address states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  const [newReceiverName, setNewReceiverName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newStreet, setNewStreet] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');

  // Cascade dropdown visibility states
  const [showAddressDropdown, setShowAddressDropdown] = useState<boolean>(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState<boolean>(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState<boolean>(false);
  const [showWardDropdown, setShowWardDropdown] = useState<boolean>(false);

  // Order placing & Payment
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PAYOS'>('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Voucher states
  const [myUnusedVouchers, setMyUnusedVouchers] = useState<CheckoutEligibleVoucherResponse[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<CheckoutEligibleVoucherResponse | null>(null);
  const [showVoucherSelector, setShowVoucherSelector] = useState<boolean>(false);
  const [manualVoucherCode, setManualVoucherCode] = useState<string>('');
  const [modalPage, setModalPage] = useState<number>(1);
  const [modalPageSize] = useState<number>(4);
  const [tempSelectedVoucher, setTempSelectedVoucher] = useState<CheckoutEligibleVoucherResponse | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Load addresses when checkout is active
  useEffect(() => {
    if (isCheckingOut && user) {
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
  }, [isCheckingOut, user]);

  // Ref for voucher dropdown
  const voucherDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside cascade dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target as Node)) {
        setShowAddressDropdown(false);
      }
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(e.target as Node)) {
        setShowWardDropdown(false);
      }
      if (voucherDropdownRef.current && !voucherDropdownRef.current.contains(e.target as Node)) {
        setShowVoucherSelector(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch cart items
  const fetchCartItems = async (targetPage: number) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await getMyCartApi(targetPage, pageSize);
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        const fetchedItems = data.items || [];
        setItems(fetchedItems);
        setPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        syncCartCount();

        // Pre-select all available items
        const inStockIds = fetchedItems.filter((i: any) => i.stockSufficient).map((i: any) => i.id);
        setSelectedItemIds(inStockIds);
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      toast.error(err.response?.data?.message || 'Không thể tải giỏ hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncCartCount = async () => {
    try {
      const res = await getCartCountApi();
      if (res.data.success) {
        setCartCount(res.data.data);
      }
    } catch (e) {
      console.error('Failed to sync cart count:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItems(page);
    } else {
      setIsLoading(false);
    }
  }, [user, page]);

  // Sync cart count when payment succeeds
  useEffect(() => {
    if (paymentSuccess) {
      syncCartCount();
    }
  }, [paymentSuccess]);

  // Quantity changes
  const handleQuantityChange = async (itemId: string, newQty: number, stockQty: number) => {
    if (newQty <= 0) return;
    if (newQty > stockQty) {
      toast.warning(`Chỉ còn ${stockQty} cuốn trong kho.`);
      return;
    }

    setIsUpdating(itemId);
    try {
      await updateCartItemApi(itemId, newQty);
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQty, stockSufficient: newQty <= item.stockQuantity }
            : item
        )
      );
      await syncCartCount();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật số lượng thất bại.');
      fetchCartItems(page);
    } finally {
      setIsUpdating(null);
    }
  };

  // Remove cart item
  const handleRemoveItem = async (itemId: string) => {
    if (!window.confirm('Xóa sản phẩm này khỏi giỏ hàng của bạn?')) return;
    try {
      await removeCartItemApi(itemId);
      toast.success('Đã xóa sản phẩm.');
      await syncCartCount();
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchCartItems(page);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xóa sản phẩm thất bại.');
    }
  };

  // Toggle selection
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const activeIds = items.filter(item => item.stockSufficient).map(item => item.id);
    if (selectedItemIds.length === activeIds.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(activeIds);
    }
  };

  // Checkout address cascade changers
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
  };

  // Selected items calculations
  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
  const totalSelectedPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load checkout-eligible vouchers from Backend API
  useEffect(() => {
    if (isCheckingOut && user && selectedItems.length > 0) {
      const fetchEligibleVouchers = async () => {
        try {
          const payload = selectedItems.map(item => ({
            editionId: item.editionId,
            quantity: item.quantity
          }));
          const res = await checkVoucherEligibilityApi(payload);
          if (res.data && res.data.success) {
            setMyUnusedVouchers(res.data.data || []);
          }
        } catch (err) {
          console.error('Lỗi khi tải danh sách voucher khả dụng:', err);
        }
      };
      fetchEligibleVouchers();
    } else {
      setMyUnusedVouchers([]);
    }
  }, [isCheckingOut, user, selectedItemIds, items]);

  // Sync selected voucher eligibility when list updates
  useEffect(() => {
    if (selectedVoucher && myUnusedVouchers.length > 0) {
      const current = myUnusedVouchers.find(uv => uv.userVoucherId === selectedVoucher.userVoucherId);
      if (!current || !current.eligible) {
        setSelectedVoucher(null); // deselect if no longer eligible
      } else {
        setSelectedVoucher(current); // update calculated discount
      }
    }
  }, [myUnusedVouchers]);

  // GHN Shipping calculation for checked out items
  useEffect(() => {
    if (!isCheckingOut || selectedItems.length === 0) return;

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
            items: selectedItems.map(item => ({ editionId: item.editionId, quantity: item.quantity }))
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
        if (!addr || !addr.districtId || !addr.wardCode) {
          setShippingFee(null);
          return;
        }
        setIsCalculatingFee(true);
        try {
          const payload = {
            toDistrictId: addr.districtId,
            toWardCode: addr.wardCode,
            items: selectedItems.map(item => ({ editionId: item.editionId, quantity: item.quantity }))
          };
          const res = await calculateShippingFeeApi(payload);
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
      }
    };

    calculateFee();
  }, [useNewAddress, selectedAddressId, selectedDistrictId, selectedWardCode, isCheckingOut, selectedItemIds, items]);

  // Voucher discount calculator (uses Backend computed value, dynamic shipping)
  const getVoucherDiscountAmount = () => {
    if (!selectedVoucher) return 0;
    const v = selectedVoucher.voucher;
    
    if (v.targetType === 'SHIPPING') {
      if (shippingFee === null) return 0;
      if (v.discountType === 'PERCENTAGE') {
        const calculated = (shippingFee * parseFloat(v.discountValue)) / 100;
        return Math.min(calculated, shippingFee);
      } else {
        return Math.min(parseFloat(v.discountValue), shippingFee);
      }
    }
    return selectedVoucher.calculatedDiscount || 0;
  };

  const handleApplyManualVoucher = () => {
    if (!manualVoucherCode.trim()) {
      toast.warning('Vui lòng nhập mã giảm giá.');
      return;
    }
    const targetCode = manualVoucherCode.trim().toUpperCase();
    const found = myUnusedVouchers.find(uv => uv.voucher.voucherCode.toUpperCase() === targetCode);
    if (!found) {
      toast.error('Mã giảm giá không tồn tại hoặc bạn chưa thu thập.');
      return;
    }
    if (!found.eligible) {
      toast.error(`Không thể áp dụng: ${found.reason || 'Không đủ điều kiện'}`);
      return;
    }
    setSelectedVoucher(found);
    toast.success(`Đã áp dụng mã giảm giá [${found.voucher.voucherCode}] thành công!`);
    setManualVoucherCode('');
  };

  // Place order execution
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0 || !user) return;

    if (shippingFee === null) {
      toast.error('Vui lòng hoàn thành địa chỉ giao hàng để tính phí vận chuyển.');
      return;
    }

    const payload: any = {
      paymentMethod,
      source: 'CART',
      cartItemIds: selectedItemIds,
      items: selectedItems.map(item => ({ 
        editionId: item.editionId, 
        quantity: item.quantity,
        flashSaleItemId: item.isFlashSale ? item.flashSaleItemId : undefined
      })),
      voucherCode: selectedVoucher ? selectedVoucher.voucher.voucherCode : undefined
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
        await syncCartCount();

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

  // Polling PayOS
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
    setIsCheckingOut(false);
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
    setSelectedVoucher(null);
    setShowVoucherSelector(false);
    fetchCartItems(1);
  };

  if (!user) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-card">
          <div className="cart-empty-icon">🔐</div>
          <h2>Yêu Cầu Đăng Nhập</h2>
          <p>Vui lòng đăng nhập tài khoản của bạn để quản lý giỏ hàng.</p>
          <button className="btn-primary" onClick={() => navigate(ROUTES.LOGIN)}>
            Đăng Nhập Ngay
          </button>
        </div>
      </div>
    );
  }

  // Render PayOS status or Success screens if already placed order
  if (orderResult) {
    return (
      <div className="cart-wrapper" style={{ maxWidth: '600px', margin: '40px auto' }}>
        {paymentSuccess ? (
          <div className="payos-qr-box" style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none', animation: 'fadeIn 0.4s ease', textAlign: 'center', maxWidth: '600px', margin: '40px auto', padding: '32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#22c55e', fontFamily: 'var(--font)', fontSize: '28px', fontWeight: '700', margin: '0 0 16px 0' }}>Thanh Toán Thành Công!</h2>
            <p style={{ color: '#111827', fontSize: '16px', marginBottom: '28px', lineHeight: '1.6' }}>
              Đơn hàng <strong style={{ color: 'var(--primary)', fontWeight: '700' }}>#{orderResult.orderCode}</strong> của bạn đã được ghi nhận thành công và đang được xử lý.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
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
                  padding: '8px 0',
                  transition: 'none'
                }}
                onClick={() => navigate(ROUTES.BOOKS)}
              >
                ← Tiếp tục mua sắm
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textDecoration: 'underline',
                  marginTop: '6px'
                }}
                onClick={handleCancelPurchase}
              >
                Về giỏ hàng
              </button>
            </div>
          </div>
        ) : (
          <div className="payos-qr-box" style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ color: '#00a85e', fontFamily: "'Playfair Display', serif", fontSize: '20px', margin: '0 0 8px 0' }}>Thanh toán qua PayOS</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
              Đơn hàng <strong>#{orderResult.orderCode}</strong>. Quét mã QR dưới đây bằng ứng dụng ngân hàng của bạn để hoàn tất thanh toán.
            </p>
            
            {orderResult.checkoutUrl ? (
              <div style={{ position: 'relative', width: '220px', height: '220px', margin: '20px auto' }}>
                <img
                  className="payos-qr-img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(orderResult.qrCode || orderResult.checkoutUrl)}`}
                  alt="QR Code"
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
              <div style={{ padding: '40px 0' }}>Không thể tạo liên kết quét mã QR.</div>
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
                {timeLeft === 0 ? 'Hết thời gian thanh toán' : 'Chờ quét mã thanh toán...'}
              </span>
            </div>

            {orderResult.checkoutUrl && timeLeft !== 0 && (
              <a
                href={orderResult.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', marginTop: '16px', color: '#00a85e', fontSize: '13.5px', fontWeight: '600', textDecoration: 'underline' }}
              >
                Nhấp vào đây để thanh toán trực tiếp qua link PayOS
              </a>
            )}
            <button type="button" className="btn-checkout-cancel" style={{ width: '100%', marginTop: '20px' }} onClick={handleCancelPurchase}>
              {timeLeft === 0 ? 'Quay lại giỏ hàng' : 'Hủy thanh toán & Quay lại'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cart-wrapper">
      <div className="cart-header-title">
        <h1 className="cart-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', color: 'var(--primary)' }}>
          Giỏ Hàng Của Bạn
        </h1>
        <span className="cart-subtitle">Có {totalCount} sản phẩm trong giỏ hàng</span>
      </div>

      {isLoading ? (
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-card" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <h2 style={{ color: 'var(--primary)', fontSize: '22px', fontWeight: '600', marginBottom: '12px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Giỏ hàng trống
            </h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-light)', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Khám phá bộ sưu tập sách lập trình phong phú của chúng tôi để mua sắm ngay.
            </p>
            <Link 
              to={ROUTES.BOOKS} 
              style={{ 
                color: 'var(--primary)', 
                fontWeight: '600', 
                fontSize: '15px', 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                fontFamily: "'Be Vietnam Pro', sans-serif",
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Tiếp tục mua sắm »
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-single-column">
          {/* Cart list */}
          <div className="cart-list-section">
            {items.map(item => (
              <div
                key={item.id}
                className={`cart-item-card ${!item.stockSufficient ? 'insufficient-stock' : ''}`}
                style={{ gridTemplateColumns: '40px 80px 2fr 120px 120px 40px' }}
              >
                {/* Checkbox selector */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <label className="cart-item-checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id)}
                      disabled={!item.stockSufficient}
                      onChange={() => toggleSelectItem(item.id)}
                      style={{ cursor: item.stockSufficient ? 'pointer' : 'not-allowed' }}
                    />
                  </label>
                </div>

                <div className="cart-item-image">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.bookTitle} />
                  ) : (
                    <div className="cart-item-placeholder">📚</div>
                  )}
                </div>

                <div className="cart-item-info">
                  <h3 className="item-title">{item.bookTitle}</h3>
                  <span className="item-author">{item.authorName}</span>
                  <div className="item-meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px', fontSize: '12px', color: '#718096' }}>
                    {item.editionNumber !== undefined && (
                      <span>Phiên bản: #{item.editionNumber}</span>
                    )}
                    {item.coverType && (
                      <span>Loại bìa: {item.coverType === 'HARD_COVER' ? 'Bìa cứng' : item.coverType === 'SOFT_COVER' ? 'Bìa mềm' : 'Đặc biệt'}</span>
                    )}
                    {item.isbn && (
                      <span>ISBN: {item.isbn}</span>
                    )}
                  </div>
                  <span className="item-price" style={{ color: 'var(--primary)' }}>{item.priceDisplay}</span>

                  {!item.stockSufficient && (
                    <span className="item-stock-warning">
                      ⚠️ Không đủ hàng (Còn {item.stockQuantity} cuốn)
                    </span>
                  )}
                </div>

                {/* Quantity input without borders and backgrounds */}
                <div className="cart-item-qty">
                  <div className="quantity-controls" style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stockQuantity)}
                      disabled={item.quantity <= 1 || isUpdating === item.id}
                      style={{ border: 'none', backgroundColor: 'transparent' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          handleQuantityChange(item.id, val, item.stockQuantity);
                        }
                      }}
                      disabled={isUpdating === item.id}
                      style={{ border: 'none', backgroundColor: '#e2e8f0', width: '36px', height: '28px', borderRadius: '4px' }}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stockQuantity)}
                      disabled={item.quantity >= item.stockQuantity || isUpdating === item.id}
                      style={{ border: 'none', backgroundColor: 'transparent' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  <span className="subtotal-val" style={{ color: 'var(--primary)' }}>
                    {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>

                {/* Sleek minimalist Trash SVG button */}
                <button
                  className="cart-item-remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Remove item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="cart-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Trước
                </button>
                <span className="pagination-text">
                  Trang {page} / {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          <div className="cart-footer-summary-bar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0',
            padding: '16px 0',
            marginTop: '24px',
            boxShadow: 'none',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="cart-item-checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14.5px' }}>
                <input
                  type="checkbox"
                  checked={items.filter(i => i.stockSufficient).length > 0 && selectedItemIds.length === items.filter(i => i.stockSufficient).length}
                  onChange={toggleSelectAll}
                />
                <span style={{ marginLeft: '4px' }}>Chọn tất cả</span>
              </label>
              <span style={{ color: 'var(--text-light)', margin: '0 4px' }}>|</span>
              <span style={{ fontSize: '14.5px', color: 'var(--text-muted)' }}>
                Đã chọn <strong style={{ color: '#2563eb' }}>{selectedItems.length}</strong> sản phẩm
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginRight: '6px' }}>Tổng thanh toán:</span>
                <strong style={{ fontSize: '20px', color: '#16a34a', fontWeight: '800' }}>
                  {totalSelectedPrice.toLocaleString('vi-VN')} VNĐ
                </strong>
              </div>
              <button
                className="btn-primary"
                disabled={selectedItems.length === 0 || isCheckingOut}
                onClick={() => setIsCheckingOut(true)}
                style={{ padding: '8px 20px', fontSize: '14px', fontWeight: '700', borderRadius: '4px' }}
              >
                Tiến Hành Thanh Toán
              </button>
            </div>
          </div>

          {/* Checkout flow details sheet expanded below */}
          {isCheckingOut && (
            <div className="checkout-section" style={{
              marginTop: '40px',
              borderTop: '1px solid var(--border)',
              paddingTop: '32px',
              animation: 'fadeIn 0.4s ease',
              textAlign: 'left'
            }}>
              <h2 className="checkout-title" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--primary)', marginBottom: '24px' }}>
                Thông tin thanh toán & Giao hàng
              </h2>

              <div className="checkout-grid">
                {/* Delivery Address Form */}
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
                        style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                      >
                        + Sử dụng địa chỉ khác
                      </button>
                    </div>
                  ) : (
                    <div style={{ animation: 'fadeIn 0.2s ease', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Nhập địa chỉ nhận hàng mới</h4>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setUseNewAddress(false)}
                            style={{ fontSize: '13px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
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
                            <div className="custom-select-dropdown" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                            <div className="custom-select-dropdown" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                            <div className="custom-select-dropdown" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
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

                {/* Payment Methods */}
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

                {/* Voucher Selection */}
                <div style={{ marginTop: '24px' }}>
                  <h3 className="checkout-subtitle">Mã giảm giá (Voucher)</h3>
                  <div className="voucher-input-group">
                    <input
                      type="text"
                      className="voucher-text-input"
                      placeholder="Nhập mã giảm giá..."
                      value={manualVoucherCode}
                      onChange={(e) => setManualVoucherCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-apply-code"
                      onClick={handleApplyManualVoucher}
                    >
                      Áp dụng
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      className="voucher-select-link-btn"
                      onClick={() => {
                        setTempSelectedVoucher(selectedVoucher);
                        setModalPage(1);
                        setShowVoucherSelector(true);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                        <path d="M13 5v14"/>
                      </svg>
                      {selectedVoucher ? 'Thay đổi voucher' : 'Chọn mã giảm giá từ ví của bạn'}
                    </button>
                    {selectedVoucher && (
                      <button
                        type="button"
                        className="btn-remove-voucher"
                        onClick={() => setSelectedVoucher(null)}
                      >
                        Bỏ áp dụng
                      </button>
                    )}
                  </div>

                  {selectedVoucher && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#fdf2f8',
                      border: '1px solid #fbcfe8',
                      borderRadius: '4px',
                      fontSize: '13.5px',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                          [{selectedVoucher.voucher.voucherCode}] - {selectedVoucher.voucher.description}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        Đơn tối thiểu: {parseFloat(selectedVoucher.voucher.minOrderValue).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  )}

                  {/* Voucher Selection Modal */}
                  {showVoucherSelector && (
                    <div className="modal-backdrop-custom" onClick={() => setShowVoucherSelector(false)}>
                      <div
                        className="modal-content-custom checkout-voucher-modal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                            Chọn Voucher
                          </h3>
                        </div>

                        <div className="modal-voucher-list">
                          {myUnusedVouchers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                              Bạn không có mã giảm giá nào khả dụng trong ví.
                            </div>
                          ) : (
                            (() => {
                              const startIndex = (modalPage - 1) * modalPageSize;
                              const visibleVouchers = myUnusedVouchers.slice(startIndex, startIndex + modalPageSize);
                              
                              return visibleVouchers.map((item) => {
                                const v = item.voucher;
                                const isPercentage = v.discountType === 'PERCENTAGE';
                                const discountDisplay = isPercentage ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString('vi-VN')}đ`;
                                const isSelected = tempSelectedVoucher?.userVoucherId === item.userVoucherId;

                                const targetLabels: Record<string, string> = {
                                  ALL: 'Toàn bộ đơn hàng',
                                  SHIPPING: 'Miễn phí vận chuyển',
                                  BOOK: 'Sách chỉ định',
                                  CATEGORY: 'Danh mục',
                                  EDITION: 'Phiên bản'
                                };

                                return (
                                  <div
                                    key={item.userVoucherId}
                                    className={`customer-voucher-card modal-voucher-card ${isSelected ? 'selected-card' : ''} ${!item.eligible ? 'ineligible-card' : ''}`}
                                    onClick={() => {
                                      if (item.eligible) {
                                        setTempSelectedVoucher(isSelected ? null : item);
                                      } else {
                                        toast.warning(`Không đủ điều kiện: ${item.reason || 'Voucher không khả dụng'}`);
                                      }
                                    }}
                                  >
                                    <div className="voucher-card-left">
                                      <div className="voucher-icon-circle">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                                          <path d="M13 5v14"/>
                                        </svg>
                                      </div>
                                      <span className="voucher-discount-tag" style={{ fontSize: '15px', fontWeight: 900 }}>
                                        {discountDisplay}
                                      </span>
                                    </div>
                                    <div className="voucher-card-right" style={{ textAlign: 'left' }}>
                                      <div className="voucher-header-info" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <span className="voucher-code-badge" style={{ backgroundColor: isSelected ? 'var(--primary-light)' : '#f3f4f6', marginRight: '8px' }}>
                                          {v.voucherCode}
                                        </span>
                                        {item.eligible ? (
                                          <span style={{ fontSize: '10px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                            Khả dụng
                                          </span>
                                        ) : (
                                          <span style={{ fontSize: '10px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                            K.Hợp lệ
                                          </span>
                                        )}
                                        {item.eligible && (
                                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                            <label className="voucher-radio-container" style={{ margin: 0 }}>
                                              <input
                                                type="radio"
                                                className="voucher-radio-input"
                                                checked={isSelected}
                                                readOnly
                                              />
                                              <span className="voucher-radio-circle"></span>
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                      <p className="voucher-description" style={{ fontSize: '11.5px', marginBottom: '4px' }}>
                                        {v.description}
                                      </p>
                                      <div style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>
                                        <p style={{ margin: '0' }}>Đơn tối thiểu: {parseFloat(v.minOrderValue).toLocaleString('vi-VN')}đ | Loại: {targetLabels[v.targetType] || v.targetType}</p>
                                        {!item.eligible && item.reason && (
                                          <p className="voucher-ineligible-reason">
                                            Lý do: {item.reason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()
                          )}
                        </div>

                        {/* Modal Pagination */}
                        {myUnusedVouchers.length > modalPageSize && (
                          <div className="modal-pagination">
                            <button
                              type="button"
                              className="modal-pagination-btn"
                              disabled={modalPage === 1}
                              onClick={() => setModalPage(p => Math.max(1, p - 1))}
                            >
                              Trước
                            </button>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              Trang {modalPage} / {Math.ceil(myUnusedVouchers.length / modalPageSize)}
                            </span>
                            <button
                              type="button"
                              className="modal-pagination-btn"
                              disabled={modalPage >= Math.ceil(myUnusedVouchers.length / modalPageSize)}
                              onClick={() => setModalPage(p => Math.min(Math.ceil(myUnusedVouchers.length / modalPageSize), p + 1))}
                            >
                              Sau
                            </button>
                          </div>
                        )}

                        {/* Modal Action buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-checkout-cancel"
                            style={{ margin: 0, padding: '8px 16px', fontSize: '13.5px' }}
                            onClick={() => setShowVoucherSelector(false)}
                          >
                            Đóng
                          </button>
                          <button
                            type="button"
                            className="btn-checkout-submit"
                            style={{ margin: 0, padding: '8px 16px', fontSize: '13.5px' }}
                            onClick={() => {
                              setSelectedVoucher(tempSelectedVoucher);
                              setShowVoucherSelector(false);
                              if (tempSelectedVoucher) {
                                toast.success(`Đã chọn mã giảm giá [${tempSelectedVoucher.voucher.voucherCode}]`);
                              }
                            }}
                          >
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing breakdown summary */}
              <div className="checkout-summary-box" style={{ marginTop: '24px', padding: '0px' }}>
                <div className="summary-row">
                  <span>Tiền hàng ({selectedItems.length} cuốn)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{totalSelectedPrice.toLocaleString('vi-VN')} VNĐ</span>
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
                {selectedVoucher && (
                  <div className="summary-row" style={{ color: '#e11d48' }}>
                    <span>Giảm giá</span>
                    <span style={{ fontWeight: '700' }}>
                      -{getVoucherDiscountAmount().toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                )}
                {selectedVoucher && selectedVoucher.voucher.targetType !== 'ALL' && selectedVoucher.voucher.targetType !== 'SHIPPING' && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-6px', marginBottom: '6px', paddingRight: '12px' }}>
                    * Giảm giá thực tế sẽ được áp dụng chính xác theo điều kiện của từng sản phẩm.
                  </div>
                )}
                <div className="summary-row total-row" style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                  <span>Tổng tiền thanh toán</span>
                  <span style={{ color: '#16a34a', fontSize: '18px', fontWeight: '800' }}>
                    {shippingFee !== null 
                      ? `${Math.max(0, totalSelectedPrice + shippingFee - getVoucherDiscountAmount()).toLocaleString('vi-VN')} VNĐ`
                      : `${Math.max(0, totalSelectedPrice - getVoucherDiscountAmount()).toLocaleString('vi-VN')} VNĐ`
                    }
                  </span>
                </div>
              </div>

              {/* Submit / Actions buttons */}
              <div className="checkout-actions-row" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-checkout-cancel" onClick={handleCancelPurchase} disabled={isPlacingOrder}>
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-checkout-submit"
                  disabled={isPlacingOrder || shippingFee === null}
                  onClick={handlePlaceOrder}
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
          )}
        </div>
      )}
    </div>
  );
}

export default CartPage;
