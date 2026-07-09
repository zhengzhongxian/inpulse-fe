import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrderDetailApi } from '../api/order';
import type { OrderDetailResponse } from '../api/order';
import { useSeo } from '../hooks/useSeo';
import './OrderDetail.css';

function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailResponse | null>(null);
  const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState<boolean>(true);

  useSeo(
    'Chi tiết đơn hàng | InkPulse Bookstore',
    'Xem chi tiết trạng thái, thông tin giao hàng và hóa đơn thanh toán của đơn hàng tại InkPulse Bookstore.'
  );

  useEffect(() => {
    const fetchDetail = async () => {
      if (!orderId) return;
      setIsLoadingOrderDetail(true);
      try {
        const res = await getOrderDetailApi(orderId);
        if (res.data.success && res.data.data) {
          setSelectedOrderDetail(res.data.data);
        } else {
          toast.error('Không tìm thấy thông tin đơn hàng.');
          navigate('/profile?tab=orders');
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', err);
        toast.error('Không thể tải chi tiết đơn hàng.');
        navigate('/profile?tab=orders');
      } finally {
        setIsLoadingOrderDetail(false);
      }
    };
    fetchDetail();
  }, [orderId, navigate]);

  if (isLoadingOrderDetail) {
    return (
      <div className="order-detail-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!selectedOrderDetail) {
    return (
      <div className="order-detail-page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', marginBottom: '20px' }}>Không tìm thấy đơn hàng</h2>
        <button className="btn-back-to-orders" onClick={() => navigate('/profile?tab=orders')}>
          ← Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page-container">
      {/* Header back navigation */}
      <div style={{ marginBottom: '24px' }}>
        <button className="btn-back-to-orders" onClick={() => navigate('/profile?tab=orders')}>
          ← Quay lại danh sách đơn hàng
        </button>
      </div>

      <div className="order-detail-card-main">
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--primary)', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Chi tiết đơn hàng: {selectedOrderDetail.orderCode}
          </h2>
          <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Ngày đặt: {selectedOrderDetail.createdAt}</span>
        </div>

        {/* Visual Order Timeline Progress Bar */}
        {(() => {
          const isConfirmed = selectedOrderDetail.orderStatus === 'PROCESSING' || selectedOrderDetail.orderStatus === 'SHIPPED' || selectedOrderDetail.orderStatus === 'DELIVERED' || selectedOrderDetail.paymentStatus === 'PAID';
          const isProcessing = selectedOrderDetail.orderStatus === 'PROCESSING' || selectedOrderDetail.orderStatus === 'SHIPPED' || selectedOrderDetail.orderStatus === 'DELIVERED' || selectedOrderDetail.paymentStatus === 'PAID';
          const isShipped = selectedOrderDetail.orderStatus === 'SHIPPED' || selectedOrderDetail.orderStatus === 'DELIVERED';
          const isDelivered = selectedOrderDetail.orderStatus === 'DELIVERED';

          const isCancelled = selectedOrderDetail.orderStatus === 'CANCELLED';

          return (
            <div style={{ margin: '0 0 32px 0', padding: '24px 0', backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                
                {/* Progress Bar Line Segments (Normal 5-stage Flow) */}
                {!isCancelled && (
                  <>
                    {/* Segment 1: Step 1 -> Step 2 */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: 'calc(10% + 24px)',
                      width: 'calc(20% - 48px)',
                      height: '1.5px',
                      backgroundColor: isConfirmed ? 'var(--primary)' : '#e5e7eb',
                      zIndex: 1,
                      transition: 'background-color 0.4s ease'
                    }} />

                    {/* Segment 2: Step 2 -> Step 3 */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: 'calc(30% + 24px)',
                      width: 'calc(20% - 48px)',
                      height: '1.5px',
                      backgroundColor: isProcessing ? 'var(--primary)' : '#e5e7eb',
                      zIndex: 1,
                      transition: 'background-color 0.4s ease'
                    }} />

                    {/* Segment 3: Step 3 -> Step 4 */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: 'calc(50% + 24px)',
                      width: 'calc(20% - 48px)',
                      height: '1.5px',
                      backgroundColor: isShipped ? 'var(--primary)' : '#e5e7eb',
                      zIndex: 1,
                      transition: 'background-color 0.4s ease'
                    }} />

                    {/* Segment 4: Step 4 -> Step 5 */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: 'calc(70% + 24px)',
                      width: 'calc(20% - 48px)',
                      height: '1.5px',
                      backgroundColor: isDelivered ? 'var(--primary)' : '#e5e7eb',
                      zIndex: 1,
                      transition: 'background-color 0.4s ease'
                    }} />
                  </>
                )}

                {/* Progress Bar Line Segments (Cancelled Flow) */}
                {isCancelled && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: 'calc(25% + 24px)',
                    width: 'calc(50% - 48px)',
                    height: '1.5px',
                    backgroundColor: '#e5e7eb',
                    zIndex: 1
                  }} />
                )}

                {/* Timeline Steps */}
                {isCancelled ? (
                  // Cancelled Flow
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{ width: '48px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', color: 'var(--primary)' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', color: 'var(--text-main)' }}>Đặt hàng</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{ width: '48px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', color: '#ef4444' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', color: '#ef4444' }}>Đã hủy</span>
                    </div>
                  </>
                ) : (
                  // Normal 5-stage Flow
                  <>
                    {/* Step 1: Chờ xác nhận */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{ width: '48px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', color: 'var(--primary)' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', color: 'var(--text-main)' }}>Chờ xác nhận</span>
                    </div>

                    {/* Step 2: Đã xác nhận */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: '48px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        color: isConfirmed ? 'var(--primary)' : '#c0c4cc'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                          <path d="M9 14l2 2 4-4"></path>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        marginTop: '6px',
                        color: isConfirmed ? 'var(--text-main)' : 'var(--text-muted)'
                      }}>
                        Đã xác nhận
                      </span>
                    </div>

                    {/* Step 3: Đang xử lý */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: '48px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        color: isProcessing ? 'var(--primary)' : '#c0c4cc'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                          <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"></polygon>
                          <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08"></polygon>
                          <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12"></polygon>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        marginTop: '6px',
                        color: isProcessing ? 'var(--text-main)' : 'var(--text-muted)'
                      }}>
                        Đang xử lý
                      </span>
                    </div>

                    {/* Step 4: Đang giao */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: '48px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        color: isShipped ? 'var(--primary)' : '#c0c4cc'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8z"></path>
                          <path d="M14 9h6.3l3 3.3v3.7a2 2 0 0 1-2 2h-1.3"></path>
                          <circle cx="7.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        marginTop: '6px',
                        color: isShipped ? 'var(--text-main)' : 'var(--text-muted)'
                      }}>
                        Đang giao
                      </span>
                    </div>

                    {/* Step 5: Hoàn thành */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: '48px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        color: isDelivered ? 'var(--primary)' : '#c0c4cc'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        marginTop: '6px',
                        color: isDelivered ? 'var(--text-main)' : 'var(--text-muted)'
                      }}>
                        Hoàn thành
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* Details grid */}
        <div className="order-detail-grid">
          <div>
            <h4 className="order-detail-section-title">Thông tin giao hàng</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 8px 0' }}>Người nhận: <strong>{selectedOrderDetail.receiverName}</strong></p>
              <p style={{ margin: '0 0 8px 0' }}>Số điện thoại: <strong style={{ color: '#2563eb' }}>{selectedOrderDetail.recipientPhone}</strong></p>
              <p style={{ margin: '0 0 8px 0' }}>Địa chỉ: <strong style={{ color: '#16a34a' }}>{selectedOrderDetail.shippingAddress} ({selectedOrderDetail.addressLabel})</strong></p>
            </div>
          </div>
          <div>
            <h4 className="order-detail-section-title">Thanh toán</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 8px 0' }}>Phương thức: <strong>{selectedOrderDetail.paymentMethod === 'PAYOS' ? <span style={{ color: '#16a34a', fontWeight: '700' }}>Thanh toán PayOS</span> : 'Thanh toán COD'}</strong></p>
              <p style={{ margin: '0 0 8px 0' }}>Trạng thái thanh toán: <strong style={{ color: '#d97706' }}>{selectedOrderDetail.paymentStatus === 'PAID' ? 'Đã thanh toán' : selectedOrderDetail.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}</strong></p>
            </div>
          </div>
        </div>

        {/* Items list */}
        <h4 className="order-detail-section-title" style={{ marginTop: '32px' }}>Sản phẩm đã mua</h4>
        <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
          <table className="order-detail-items-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingLeft: 0 }}>Sách</th>
                <th style={{ textAlign: 'center' }}>Số lượng</th>
                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                <th style={{ textAlign: 'right', paddingRight: 0 }}>Tạm tính</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderDetail.items && selectedOrderDetail.items.map((item: any) => (
                <tr key={item.editionId}>
                  <td style={{ paddingLeft: 0 }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.bookTitle} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: '50px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '24px' }}>📚</div>
                      )}
                      <div>
                        <div className="order-detail-book-title" style={{ fontSize: '16px' }}>{item.bookTitle}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.authorName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>{item.priceDisplay}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)', paddingRight: 0 }}>{item.subtotalDisplay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fee breakdown */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div className="order-detail-row" style={{ width: '280px' }}>
            <span>Tiền hàng:</span>
            <strong style={{ color: 'var(--primary)' }}>{selectedOrderDetail.orderFeeDisplay}</strong>
          </div>
          <div className="order-detail-row" style={{ width: '280px' }}>
            <span>Phí vận chuyển:</span>
            <strong style={{ color: '#2563eb' }}>{selectedOrderDetail.shippingFeeDisplay}</strong>
          </div>
          <div className="order-detail-row total" style={{ width: '280px', borderTop: '1.5px solid var(--border)', paddingTop: '12px', marginTop: '6px' }}>
            <span>Tổng tiền thanh toán:</span>
            <strong style={{ color: '#16a34a', fontSize: '18px' }}>{selectedOrderDetail.totalDisplay}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
