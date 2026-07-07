import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import { getBooksApi } from '../../api/books';
import type { BookResponse } from '../../api/books';
import './Header.css';

function Header() {
  const { isLoggedIn, userCoins: coins, cartCount } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [recommendations, setRecommendations] = useState<BookResponse[]>([]);
  const [showRecs, setShowRecs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search logic
  useEffect(() => {
    if (searchKeyword.trim().length < 2) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await getBooksApi({
          searchKeyword: searchKeyword.trim(),
          pageSize: 5
        });
        if (response.data && response.data.success && response.data.data) {
          setRecommendations(response.data.data.items || []);
        }
      } catch (err) {
        console.error('Error fetching search recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Click outside to close recommendations
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowRecs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`${ROUTES.BOOKS}?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setShowRecs(false);
    }
  };

  const handleRecommendationClick = () => {
    setShowRecs(false);
    setSearchKeyword('');
  };

  return (
    <header>
      <div className="nav-container">
        <Link to={ROUTES.HOME} className="logo" style={{ textDecoration: 'none' }}>
          <img src="/ChatGPT Image Jun 14, 2026, 10_34_09 PM.png" alt="InkPulse" className="logo-img" />
        </Link>

        {/* Floating wrapper container to prevent search bar border-radius hidden clipping */}
        <div className="search-container-wrap" ref={searchContainerRef}>
          <form className="header-search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              className="search-input"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setShowRecs(true);
              }}
              onFocus={() => setShowRecs(true)}
            />
            <button type="submit" className="search-btn">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* Search suggestions dropdown */}
          {showRecs && (searchKeyword.trim().length >= 2) && (
            <div className="search-recommendations">
              {isLoading ? (
                <div className="search-rec-loading">
                  <span className="btn-spinner"></span>
                  <span style={{ marginLeft: '10px' }}>Đang tìm kiếm sách...</span>
                </div>
              ) : recommendations.length > 0 ? (
                <>
                  <div className="search-rec-list">
                    {recommendations.map(book => {
                      // Navigate to book detail page
                      const detailPath = `/book/${book.id}`;
                      return (
                        <Link
                          key={book.id}
                          to={detailPath}
                          className="search-rec-item"
                          onClick={handleRecommendationClick}
                        >
                          <img src={book.thumbnailUrl} alt={book.title} className="search-rec-thumb" />
                          <div className="search-rec-info">
                            <h4 className="search-rec-title">{book.title}</h4>
                            <span className="search-rec-author">{book.authors?.join(', ')}</span>
                            <div className="search-rec-meta">
                              <span className="search-rec-price">{book.priceDisplay}</span>
                              <span className="search-rec-stars">⭐⭐⭐⭐⭐</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div
                    className="search-rec-all-btn"
                    onClick={() => handleSearchSubmit()}
                  >
                    Xem tất cả kết quả cho "{searchKeyword}"
                  </div>
                </>
              ) : (
                <div className="search-rec-empty">
                  Không tìm thấy sách "{searchKeyword}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nav-actions">
          {/* Giỏ hàng icon */}
          <div className="header-icon-wrap">
            <Link to={ROUTES.CART} className="header-icon-btn">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && <span className="badge-count cart-badge">{cartCount}</span>}
            </Link>
          </div>

          {/* Tài khoản icon */}
          <div className="header-icon-wrap">
            {!isLoggedIn ? (
              <Link
                to={ROUTES.LOGIN}
                className="header-icon-btn"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="badge-count coin-badge">{coins} xu</span>
              </Link>
            ) : (
              <Link
                to={ROUTES.PROFILE}
                className="header-icon-btn"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="badge-count coin-badge">{coins} xu</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
