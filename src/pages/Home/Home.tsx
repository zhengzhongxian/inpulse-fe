import type { Book } from '../../types';
import BookCard from '../../components/BookCard/BookCard';
import './Home.css';

interface HomeProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

function Home({ books, onSelectBook }: HomeProps) {
  return (
    <div>
      {/* Hero Features Block instead of standard Banner */}
      <section className="home-hero-features">
        {/* Card 1: Programming */}
        <div className="hero-feature-card">
          <div className="feature-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="white-icon">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="feature-content">
            <h3 className="feature-title">Sách Lập Trình</h3>
            <p className="feature-desc">Kho tàng tri thức cao cấp và thực chiến</p>
            <div className="feature-footer">
              <span className="feature-meta">Hơn 500+ đầu sách</span>
              <a href="#books-list" className="btn-feature-action">Xem ngay</a>
            </div>
          </div>
        </div>

        {/* Card 2: System Architecture */}
        <div className="hero-feature-card">
          <div className="feature-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="white-icon">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div className="feature-content">
            <h3 className="feature-title">Thiết Kế Hệ Thống</h3>
            <p className="feature-desc">Kiến trúc phân tán, CQRS & Event Sourcing</p>
            <div className="feature-footer">
              <span className="feature-meta">200+ tài liệu chuyên sâu</span>
              <a href="#books-list" className="btn-feature-action">Khám phá</a>
            </div>
          </div>
        </div>

        {/* Card 3: Database */}
        <div className="hero-feature-card">
          <div className="feature-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="white-icon">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
            </svg>
          </div>
          <div className="feature-content">
            <h3 className="feature-title">Cơ Sở Dữ Liệu</h3>
            <p className="feature-desc">Tối ưu SQL, NoSQL & Caching nâng cao</p>
            <div className="feature-footer">
              <span className="feature-meta">150+ sách thực chiến</span>
              <a href="#books-list" className="btn-feature-action">Tìm hiểu</a>
            </div>
          </div>
        </div>

        {/* Card 4: Express Delivery */}
        <div className="hero-feature-card">
          <div className="feature-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="white-icon">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div className="feature-content">
            <h3 className="feature-title">Giao Nhanh 24H</h3>
            <p className="feature-desc">Nhận sách nhanh chóng trong ngày</p>
            <div className="feature-footer">
              <span className="feature-meta">Ship COD toàn quốc</span>
              <a href="#books-list" className="btn-feature-action">Mua ngay</a>
            </div>
          </div>
        </div>
      </section>

      {/* Books catalog grid */}
      <section className="section-container" id="books-list">
        <div className="section-header">
          <div>
            <h2 className="section-title">Sách hiện đang bán</h2>
          </div>
          <div className="filter-tabs">
            <button className="filter-tab active">Tất cả</button>
            <button className="filter-tab">Lập trình</button>
            <button className="filter-tab">Kiến trúc</button>
            <button className="filter-tab">Database</button>
          </div>
        </div>

        <div className="book-grid">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={onSelectBook}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
