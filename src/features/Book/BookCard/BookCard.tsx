import { Link, useNavigate } from 'react-router-dom';
import type { Book } from '../../../models/Book';
import { useNavigation } from '../../../context/NavigationContext';
import { buildBookDetailPath } from '../../../config/routes';
import './BookCard.css';

const getCoverTypeName = (type?: string) => {
  switch (type) {
    case 'SOFT_COVER': return 'Bìa mềm';
    case 'HARD_COVER': return 'Bìa cứng';
    case 'SPECIAL': return 'Bản đặc biệt';
    default: return type || '';
  }
};

const getChipClass = (type?: string) => {
  switch (type) {
    case 'SOFT_COVER': return 'edition-chip soft-cover';
    case 'HARD_COVER': return 'edition-chip hard-cover';
    case 'SPECIAL': return 'edition-chip special';
    default: return 'edition-chip';
  }
};

function BookCard({ book }: { book: Book }) {
  const { setSelectedDetailBook } = useNavigation();
  const navigate = useNavigate();

  const editions = book.otherVersions || [];

  // Always display the cheapest edition's price
  const minPriceEdition = editions.length > 0
    ? editions.reduce((min, curr) => curr.price < min.price ? curr : min, editions[0])
    : null;

  const displayPrice = minPriceEdition?.priceDisplay || book.price;
  const showFromLabel = editions.length > 1;

  const detailPath = minPriceEdition
    ? `${buildBookDetailPath(book.id)}?editionId=${minPriceEdition.id}`
    : buildBookDetailPath(book.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering card navigation when interacting with other elements if needed
    setSelectedDetailBook(book);
    navigate(detailPath);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      className="book-card"
      style={{ textDecoration: 'none', cursor: 'pointer' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick(null as any);
        }
      }}
    >
      <div className="book-cover-wrap">
        {book.tag && (
          <span
            className="book-badge"
            style={{
              backgroundColor: book.badgeBgColor || undefined,
              color: book.badgeTextColor || undefined
            }}
          >
            {book.tag}
          </span>
        )}
        {book.thumbnailUrl ? (
          <img
            src={book.thumbnailUrl}
            alt={book.title}
            className="book-cover"
          />
        ) : (
          book.svgCover
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <span className="book-author">{book.author}</span>

        {/* Edition selector chips — clicking navigates to that edition's detail */}
        {editions.length > 1 && (
          <div className="edition-selector">
            {editions.map(ed => (
              <Link
                key={ed.id}
                to={`${buildBookDetailPath(book.id)}?editionId=${ed.id}`}
                className={getChipClass(ed.coverType)}
                onClick={(e) => e.stopPropagation()}
              >
                {getCoverTypeName(ed.coverType)}
              </Link>
            ))}
          </div>
        )}

        <div className="book-meta">
          <div className="book-price">
            <span className="price-now">
              {showFromLabel && <span className="price-from-label">chỉ từ</span>}
              {displayPrice.replace('chỉ từ ', '')}
            </span>
          </div>
          <span className="book-sold">
            Đã bán {editions.reduce((sum, ed) => sum + (ed.soldCount || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
