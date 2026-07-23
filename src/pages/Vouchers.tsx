import { useState, useEffect, useRef } from 'react';
import { getPublicVouchersApi, getPublicVoucherDetailApi, exchangeVoucherApi, getMyVouchersApi } from '../api/vouchers';
import { useSeo } from '../hooks/useSeo';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Vouchers.css';

interface VoucherDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

const VoucherDropdown = ({ value, onChange, options, placeholder }: VoucherDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="voucher-dropdown-container" ref={containerRef}>
      <div 
        className={`voucher-dropdown-header ${isOpen ? 'open' : ''} ${value ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`voucher-dropdown-arrow ${isOpen ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && (
        <div className="voucher-dropdown-menu">
          <div 
            className={`voucher-dropdown-item ${!value ? 'selected' : ''}`}
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`voucher-dropdown-item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Vouchers = () => {
  useSeo(
    'Chương trình khuyến mãi & Voucher | InkPulse Bookstore',
    'Khám phá danh sách các chương trình khuyến mãi, mã giảm giá và voucher hấp dẫn đang diễn ra tại hiệu sách InkPulse Bookstore.'
  );

  const { isLoggedIn, userCoins, handleUpdateUserCoins } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');

  // Tab 1: All Vouchers
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [vouchersPage, setVouchersPage] = useState<number>(1);
  const [vouchersTotalPages, setVouchersTotalPages] = useState<number>(1);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState<boolean>(false);

  // All Vouchers Filters
  const [search, setSearch] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('');
  const [discountType, setDiscountType] = useState<string>('');
  const [suitableOnly, setSuitableOnly] = useState<boolean>(false);

  // Tab 2: My Vouchers
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [myPage, setMyPage] = useState<number>(1);
  const [myTotalPages, setMyTotalPages] = useState<number>(1);
  const [isLoadingMyVouchers, setIsLoadingMyVouchers] = useState<boolean>(false);

  // My Vouchers Filters
  const [myStatus, setMyStatus] = useState<string>('');

  // Voucher Detail states
  const [selectedVoucherDetail, setSelectedVoucherDetail] = useState<any>(null);
  const [showVoucherDetailModal, setShowVoucherDetailModal] = useState<boolean>(false);
  const [isLoadingVoucherDetail, setIsLoadingVoucherDetail] = useState<boolean>(false);

  // Exchanging state
  const [isExchangingId, setIsExchangingId] = useState<string | null>(null);

  const fetchVouchers = async () => {
    setIsLoadingVouchers(true);
    try {
      const params: any = {
        page: vouchersPage,
        size: 6,
        search: search || undefined,
        targetType: targetType || undefined,
        discountType: discountType || undefined,
        suitableOnly: suitableOnly || undefined
      };
      const res = await getPublicVouchersApi(params);
      if (res.data && res.data.success) {
        setVouchers(res.data.data.items || []);
        setVouchersTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách voucher:', err);
      toast.error('Không thể tải danh sách voucher.');
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  const fetchMyVouchers = async () => {
    if (!isLoggedIn) return;
    setIsLoadingMyVouchers(true);
    try {
      const params: any = {
        page: myPage,
        size: 6,
        status: (myStatus && myStatus !== 'ACTIVE_UNUSED') ? myStatus : undefined,
        activeOnly: myStatus === 'ACTIVE_UNUSED' ? true : undefined
      };
      const res = await getMyVouchersApi(params);
      if (res.data && res.data.success) {
        setMyVouchers(res.data.data.items || []);
        setMyTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi tải voucher của bạn:', err);
      toast.error('Không thể tải danh sách voucher đã đổi.');
    } finally {
      setIsLoadingMyVouchers(false);
    }
  };

  const handleViewVoucherDetail = async (voucherId: string) => {
    setIsLoadingVoucherDetail(true);
    setSelectedVoucherDetail(null);
    setShowVoucherDetailModal(true);
    try {
      const res = await getPublicVoucherDetailApi(voucherId);
      if (res.data && res.data.success) {
        setSelectedVoucherDetail(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết voucher:', err);
      toast.error('Không thể tải chi tiết voucher.');
      setShowVoucherDetailModal(false);
    } finally {
      setIsLoadingVoucherDetail(false);
    }
  };

  const handleExchangeVoucher = async (voucherId: string, coinCost: number, voucherCode: string) => {
    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để thực hiện đổi voucher!');
      return;
    }
    if (userCoins < coinCost) {
      toast.error('Bạn không đủ xu để đổi voucher này.');
      return;
    }

    setIsExchangingId(voucherId);
    try {
      const res = await exchangeVoucherApi(voucherId);
      if (res.data && res.data.success) {
        toast.success(`Đổi thành công mã ${voucherCode}!`);
        handleUpdateUserCoins(coinCost);
        // Refresh appropriate lists
        fetchVouchers();
        if (activeTab === 'mine') {
          fetchMyVouchers();
        }
      } else {
        toast.error(res.data.message || 'Đổi voucher thất bại.');
      }
    } catch (err: any) {
      console.error('Lỗi khi đổi voucher:', err);
      const errMsg = err.response?.data?.message || 'Đổi voucher thất bại.';
      toast.error(errMsg);
    } finally {
      setIsExchangingId(null);
    }
  };

  // Fetch public list on load and when filters/page change
  useEffect(() => {
    if (activeTab === 'all') {
      fetchVouchers();
    }
  }, [vouchersPage, targetType, discountType, suitableOnly, activeTab]);

  // Handle manual search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVouchersPage(1);
    fetchVouchers();
  };

  // Fetch my list when tab, page, or my filters change
  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyVouchers();
    }
  }, [myPage, myStatus, activeTab]);

  return (
    <div className="vouchers-wrapper">
      <h1 className="vouchers-title-main">Khuyến mãi & Voucher</h1>
      <p className="vouchers-subtitle">Khám phá các chương trình ưu đãi và đổi voucher bằng xu tích lũy.</p>

      {/* Coin Balance Banner */}
      {isLoggedIn && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fde68a',
          padding: '8px 20px',
          borderRadius: '0px',
          marginBottom: '24px',
          color: '#b45309',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(251, 191, 36, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>Tích lũy xu để đổi những mã giảm giá cực kỳ giá trị!</span>
          </div>
          <span style={{ fontSize: '14px', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Ví xu: <strong style={{ color: '#d97706' }}>{userCoins} xu</strong>
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="vouchers-tabs" style={{ display: 'flex', gap: '16px', borderBottom: '2px solid var(--border)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button
          onClick={() => { setActiveTab('all'); setVouchersPage(1); }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '8px 16px',
            marginBottom: '-11px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Tất cả Voucher
        </button>
        {isLoggedIn && (
          <button
            onClick={() => { setActiveTab('mine'); setMyPage(1); }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              fontWeight: 700,
              color: activeTab === 'mine' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'mine' ? '3px solid var(--primary)' : '3px solid transparent',
              padding: '8px 16px',
              marginBottom: '-11px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Voucher của tôi
          </button>
        )}
      </div>

      {/* TAB 1: ALL VOUCHERS */}
      {activeTab === 'all' && (
        <div>
          {/* Filters Row */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <div className="voucher-search-wrapper">
              <input
                type="text"
                className="voucher-search-input"
                placeholder="Tìm kiếm mã..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="voucher-search-icon">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
            </div>
            <VoucherDropdown
              value={targetType}
              onChange={(val) => { setTargetType(val); setVouchersPage(1); }}
              options={[
                { value: 'ALL', label: 'Tổng đơn hàng' },
                { value: 'SHIPPING', label: 'Phí vận chuyển' },
                { value: 'CATEGORY', label: 'Theo danh mục' },
                { value: 'BOOK', label: 'Theo sách' },
                { value: 'EDITION', label: 'Theo phiên bản' }
              ]}
              placeholder="-- Loại áp dụng --"
            />
            <VoucherDropdown
              value={discountType}
              onChange={(val) => { setDiscountType(val); setVouchersPage(1); }}
              options={[
                { value: 'PERCENTAGE', label: 'Giảm phần trăm' },
                { value: 'FIXED_AMOUNT', label: 'Giảm số tiền' }
              ]}
              placeholder="-- Kiểu giảm giá --"
            />
            {isLoggedIn && (
              <label className="voucher-radio-container">
                <input
                  type="radio"
                  className="voucher-radio-input"
                  checked={suitableOnly}
                  onClick={() => { setSuitableOnly(!suitableOnly); setVouchersPage(1); }}
                  onChange={() => {}}
                />
                <span className="voucher-radio-circle"></span>
                Chỉ hiện voucher phù hợp
              </label>
            )}
            <button type="submit" className="btn-search-voucher" title="Lọc">
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
          </form>

          {/* Grid list */}
          <div className="customer-voucher-container">
            {isLoadingVouchers ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(236, 72, 153, 0.15)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : vouchers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', border: '1.5px dashed var(--border)', borderRadius: '8px' }}>
                Không tìm thấy voucher khuyến mãi phù hợp.
              </div>
            ) : (
              <>
                <div className="customer-voucher-grid">
                  {vouchers.map((v) => {
                    const now = new Date();
                    const isExpired = new Date(v.endDate) < now;
                    const isPercentage = v.discountType === 'PERCENTAGE';
                    const discountDisplay = isPercentage ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString('vi-VN')}đ`;
                    
                    return (
                      <div key={v.voucherId} className={`customer-voucher-card ${isExpired ? 'expired' : ''}`}>
                        <div className="voucher-card-left">
                          <div className="voucher-icon-circle">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                              <path d="M13 5v14"/>
                            </svg>
                          </div>
                          <span className="voucher-discount-tag" style={{ fontSize: '18px', fontWeight: 900 }}>{discountDisplay}</span>
                        </div>
                        <div className="voucher-card-right">
                          <div className="voucher-header-info">
                            <span className="voucher-code-badge">{v.voucherCode}</span>
                            {v.coinCost > 0 && (
                              <span className="voucher-coin-cost" style={{ display: 'flex', alignItems: 'center', color: '#dd6b20', fontWeight: 700 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '3px' }}>
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="M12 8v8"/>
                                  <path d="M8 12h8"/>
                                </svg>
                                {v.coinCost} xu
                              </span>
                            )}
                          </div>
                          <p className="voucher-description">{v.description || 'Giảm giá áp dụng cho đơn hàng.'}</p>
                          <div className="voucher-footer-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span className="voucher-expiry" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="btn-view-voucher-detail"
                                onClick={() => handleViewVoucherDetail(v.voucherId)}
                                style={{ padding: '4px 10px', fontSize: '12.5px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', background: 'transparent', color: 'var(--text-main)' }}
                              >
                                Chi tiết
                              </button>
                              {v.coinCost > 0 && (
                                <button
                                  type="button"
                                  disabled={isExchangingId === v.voucherId || (isLoggedIn && userCoins < v.coinCost)}
                                  onClick={() => handleExchangeVoucher(v.voucherId, v.coinCost, v.voucherCode)}
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '12.5px',
                                    backgroundColor: isLoggedIn && userCoins < v.coinCost ? '#e2e8f0' : 'var(--primary)',
                                    color: isLoggedIn && userCoins < v.coinCost ? '#a0aec0' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isLoggedIn && userCoins < v.coinCost ? 'not-allowed' : 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  {isExchangingId === v.voucherId ? 'Đang đổi...' : 'Đổi xu'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {vouchersTotalPages > 1 && (
                  <div className="orders-pagination" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      className="orders-pagination-btn"
                      onClick={() => setVouchersPage(prev => Math.max(prev - 1, 1))}
                      disabled={vouchersPage === 1}
                      style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: vouchersTotalPages }, (_, idx) => idx + 1).map((pNum) => (
                      <button
                        key={pNum}
                        className={`orders-pagination-btn ${vouchersPage === pNum ? 'active' : ''}`}
                        onClick={() => setVouchersPage(pNum)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          background: vouchersPage === pNum ? 'var(--primary)' : 'transparent',
                          color: vouchersPage === pNum ? '#ffffff' : 'var(--text-main)',
                          fontWeight: vouchersPage === pNum ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {pNum}
                      </button>
                    ))}
                    <button
                      className="orders-pagination-btn"
                      onClick={() => setVouchersPage(prev => Math.min(prev + 1, vouchersTotalPages))}
                      disabled={vouchersPage === vouchersTotalPages}
                      style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY VOUCHERS */}
      {activeTab === 'mine' && isLoggedIn && (
        <div>
          {/* Filters Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <VoucherDropdown
              value={myStatus}
              onChange={(val) => { setMyStatus(val); setMyPage(1); }}
              options={[
                { value: 'ACTIVE_UNUSED', label: 'Còn hạn & Chưa sử dụng' },
                { value: 'UNUSED', label: 'Chưa sử dụng' },
                { value: 'USED', label: 'Đã sử dụng' },
                { value: 'EXPIRED', label: 'Đã hết hạn' }
              ]}
              placeholder="-- Trạng thái sử dụng --"
            />
          </div>

          {/* Grid list */}
          <div className="customer-voucher-container">
            {isLoadingMyVouchers ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(236, 72, 153, 0.15)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : myVouchers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', border: '1.5px dashed var(--border)', borderRadius: '8px' }}>
                Bạn chưa có mã giảm giá đã đổi nào phù hợp bộ lọc.
              </div>
            ) : (
              <>
                <div className="customer-voucher-grid">
                  {myVouchers.map((item) => {
                    const v = item.voucher;
                    const isPercentage = v.discountType === 'PERCENTAGE';
                    const discountDisplay = isPercentage ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString('vi-VN')}đ`;
                    
                    // Style status badge
                    let statusLabel = 'Chưa dùng';
                    let statusColor = '#d97706';
                    let statusBg = '#fffbeb';

                    if (item.status === 'USED') {
                      statusLabel = 'Đã sử dụng';
                      statusColor = '#16a34a';
                      statusBg = '#f0fdf4';
                    } else if (item.status === 'EXPIRED' || new Date(v.endDate) < new Date()) {
                      statusLabel = 'Hết hạn';
                      statusColor = '#dc2626';
                      statusBg = '#fef2f2';
                    }

                    return (
                      <div key={item.userVoucherId} className={`customer-voucher-card ${item.status !== 'UNUSED' ? 'expired' : ''}`}>
                        <div className="voucher-card-left">
                          <div className="voucher-icon-circle">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                              <path d="M13 5v14"/>
                            </svg>
                          </div>
                          <span className="voucher-discount-tag" style={{ fontSize: '18px', fontWeight: 900 }}>{discountDisplay}</span>
                        </div>
                        <div className="voucher-card-right">
                          <div className="voucher-header-info">
                            <span className="voucher-code-badge" style={{ cursor: 'pointer' }} onClick={() => {
                              navigator.clipboard.writeText(v.voucherCode);
                              toast.success('Đã sao chép mã giảm giá!');
                            }} title="Click để sao chép mã">
                              {v.voucherCode}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: '4px' }}>
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                            </span>
                            <span style={{ fontSize: '11px', color: statusColor, backgroundColor: statusBg, padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="voucher-description">{v.description || 'Giảm giá áp dụng cho đơn hàng.'}</p>
                          <div className="voucher-footer-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span className="voucher-expiry" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              Đã đổi: {new Date(item.acquiredAt).toLocaleDateString('vi-VN')}
                            </span>
                            <button
                              type="button"
                              className="btn-view-voucher-detail"
                              onClick={() => handleViewVoucherDetail(v.voucherId)}
                              style={{ padding: '4px 10px', fontSize: '12.5px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', background: 'transparent', color: 'var(--text-main)' }}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {myTotalPages > 1 && (
                  <div className="orders-pagination" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      className="orders-pagination-btn"
                      onClick={() => setMyPage(prev => Math.max(prev - 1, 1))}
                      disabled={myPage === 1}
                      style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: myTotalPages }, (_, idx) => idx + 1).map((pNum) => (
                      <button
                        key={pNum}
                        className={`orders-pagination-btn ${myPage === pNum ? 'active' : ''}`}
                        onClick={() => setMyPage(pNum)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          background: myPage === pNum ? 'var(--primary)' : 'transparent',
                          color: myPage === pNum ? '#ffffff' : 'var(--text-main)',
                          fontWeight: myPage === pNum ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {pNum}
                      </button>
                    ))}
                    <button
                      className="orders-pagination-btn"
                      onClick={() => setMyPage(prev => Math.min(prev + 1, myTotalPages))}
                      disabled={myPage === myTotalPages}
                      style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {showVoucherDetailModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowVoucherDetailModal(false)}>
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              color: '#2d3748',
              border: 'none',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#da447d', margin: 0 }}>
                Chi tiết Voucher
              </h3>
              <button
                type="button"
                onClick={() => setShowVoucherDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#718096',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#da447d')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#718096')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {isLoadingVoucherDetail ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(236, 72, 153, 0.15)', borderTopColor: '#da447d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : selectedVoucherDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #fff5f7 0%, #fff0f3 100%)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1.5px dashed #f472b6'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, letterSpacing: '0.5px' }}>MÃ GIẢM GIÁ</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#da447d', marginTop: '4px', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {selectedVoucherDetail.voucherCode}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, letterSpacing: '0.5px' }}>MỨC GIẢM</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                      {selectedVoucherDetail.discountType === 'PERCENTAGE' 
                        ? `${selectedVoucherDetail.discountValue}%` 
                        : `${Number(selectedVoucherDetail.discountValue).toLocaleString('vi-VN')}đ`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Mô tả</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '70%', color: '#1a202c' }}>
                      {selectedVoucherDetail.description || 'Không có mô tả.'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Đơn tối thiểu</span>
                    <span style={{ fontWeight: 700, color: '#2b6cb0' }}>
                      {Number(selectedVoucherDetail.minOrderValue).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Giá trị đổi xu</span>
                    <span style={{ fontWeight: 700, color: selectedVoucherDetail.coinCost > 0 ? '#dd6b20' : '#10b981' }}>
                      {selectedVoucherDetail.coinCost > 0 ? `${selectedVoucherDetail.coinCost} xu` : 'Miễn phí'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Lượt dùng tối đa/Khách</span>
                    <span style={{ fontWeight: 700, color: '#4a5568' }}>
                      {selectedVoucherDetail.maxUsesPerUser} lượt
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Đối tượng áp dụng</span>
                    <span style={{ fontWeight: 700, color: '#319795' }}>
                      {selectedVoucherDetail.targetType === 'ALL' && 'Tổng đơn hàng'}
                      {selectedVoucherDetail.targetType === 'SHIPPING' && 'Phí vận chuyển'}
                      {selectedVoucherDetail.targetType === 'CATEGORY' && 'Theo danh mục'}
                      {selectedVoucherDetail.targetType === 'BOOK' && 'Theo sách cụ thể'}
                      {selectedVoucherDetail.targetType === 'EDITION' && 'Theo phiên bản sách'}
                    </span>
                  </div>

                  {selectedVoucherDetail.targetItems && selectedVoucherDetail.targetItems.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                      <span style={{ color: '#718096', fontWeight: 500 }}>Danh sách áp dụng:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {selectedVoucherDetail.targetItems.map((item: any) => (
                          <span key={item.id} style={{ fontSize: '11px', backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', color: '#4a5568', padding: '4px 10px', borderRadius: '4px', fontWeight: 500 }}>
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Ngày bắt đầu</span>
                    <span style={{ fontWeight: 600, color: '#4a5568' }}>
                      {new Date(selectedVoucherDetail.startDate).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#718096', fontWeight: 500 }}>Hạn sử dụng</span>
                    <span style={{ fontWeight: 700, color: '#e53e3e' }}>
                      {new Date(selectedVoucherDetail.endDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
                Không tìm thấy thông tin chi tiết voucher.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers;
