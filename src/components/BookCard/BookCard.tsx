import React from 'react';
import type { Book } from '../../types';
import './BookCard.css';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

function BookCard({ book, onSelect }: BookCardProps) {
  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
  };

  return (
    <div className="book-card" onClick={() => onSelect(book)}>
      <div className="book-cover-wrap">
        <span className={`book-badge ${book.tagClass || ''}`}>{book.tag}</span>
        {book.svgCover}
      </div>
      <div className="book-info">
        <span className="book-author">{book.author}</span>
        <h3 className="book-title">{book.title}</h3>
        <div className="book-meta">
          <div className="book-price">
            <span className="price-now">{book.price}</span>
            {book.wasPrice && <span className="price-was">{book.wasPrice}</span>}
          </div>
          <button className="btn-buy" onClick={handleBuyClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
