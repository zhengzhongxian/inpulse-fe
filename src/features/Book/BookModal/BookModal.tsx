import type { Book } from '../../../models/Book';
import './BookModal.css';

interface BookModalProps {
  book: Book;
  onClose: () => void;
}

function BookModal({ book, onClose }: BookModalProps) {
  const handleAddToCart = () => {
    alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, margin: '0 auto' }}>
            {book.svgCover}
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {book.author}
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 16px 0' }}>
              {book.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.7' }}>
              {book.desc}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Giá bán:</span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{book.price}</span>
              </div>
              <button 
                className="btn-primary" 
                onClick={handleAddToCart}
              >
                Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookModal;
