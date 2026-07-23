import { useState, useEffect } from 'react';
import BookCard from '../features/Book/BookCard/BookCard';
import { getBooksApi } from '../api/books';
import { getCategoriesApi } from '../api/categories';
import FlashSaleSection from '../components/FlashSale/FlashSaleSection';
import { mapResponseToBook } from '../utils/bookHelper';
import type { Book } from '../models/Book';
import type { BookResponse } from '../api/books';
import { useSeo } from '../hooks/useSeo';
import './Home.css';

function Home() {
  useSeo(
    'InkPulse Bookstore - Nhà sách lập trình & kiến trúc hệ thống trực tuyến',
    'Mua sách lập trình cao cấp, thiết kế kiến trúc hệ thống, CQRS, Event Sourcing, Redis Stack, Microservices thực chiến bản đẹp bìa cứng tại InkPulse.'
  );

  const [books, setBooks] = useState<Book[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([
    { name: 'Tất cả', slug: 'all' }
  ]);
  const [hasMoreCategories, setHasMoreCategories] = useState<boolean>(false);

  const loadBooks = async (page: number, category: string, append: boolean) => {
    setIsPageLoading(true);
    try {
      const activeFilters = {
        pageNumber: page,
        pageSize: 4,
        categorySlug: category,
      };

      // Clean empty params
      Object.keys(activeFilters).forEach(key => {
        if ((activeFilters as any)[key] === '' || (activeFilters as any)[key] === undefined) {
          delete (activeFilters as any)[key];
        }
      });

      const response = await getBooksApi(activeFilters);
      
      const data = response.data;
      if (data && data.success && data.data) {
        const pagedList = data.data;
        const mappedBooks = pagedList.items.map((item: BookResponse) => mapResponseToBook(item));
        
        if (append) {
          setBooks(prev => {
            // Avoid duplicate ids if any
            const existingIds = new Set(prev.map(b => b.id));
            const uniqueNew = mappedBooks.filter((b: Book) => !existingIds.has(b.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setBooks(mappedBooks);
        }
        setHasMore(pagedList.hasNext);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sách:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesApi();
        const data = response.data;
        if (data && data.success && Array.isArray(data.data)) {
          const apiCats = data.data;
          // Display at most the first 3 categories
          const displayedCats = apiCats.slice(0, 3).map((c: any) => ({
            name: c.name,
            slug: c.slug
          }));
          setCategories([
            { name: 'Tất cả', slug: 'all' },
            ...displayedCats
          ]);
          setHasMoreCategories(apiCats.length > 3);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    loadBooks(1, selectedCategory, false);
    setPageNumber(1);
  }, [selectedCategory]);

  const handleLoadMore = () => {
    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    loadBooks(nextPage, selectedCategory, true);
  };

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

      <FlashSaleSection />

      {/* Books catalog grid */}
      <section className="section-container" id="books-list">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '38px', height: '38px', backgroundColor: 'rgba(218, 68, 125, 0.08)', borderRadius: '50%',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#da447d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <h2 className="section-title" style={{ margin: 0 }}>Sách hiện đang bán</h2>
          </div>
          <div className="filter-tabs">
            {categories.map(cat => (
              <button
                key={cat.slug}
                className={`filter-tab ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
            {hasMoreCategories && (
              <span className="view-all-categories-link">
                Xem tất cả danh mục &gt;&gt;
              </span>
            )}
          </div>
        </div>

        <div className="book-grid">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
            />
          ))}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button 
              className="btn-load-more" 
              onClick={handleLoadMore}
              disabled={isPageLoading}
            >
              {isPageLoading ? (
                <span className="btn-spinner"></span>
              ) : (
                'Xem thêm'
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
