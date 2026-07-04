import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBooksApi } from '../api/books';
import type { BookResponse } from '../api/books';
import { getCategoriesApi } from '../api/categories';
import type { CategoryResponse } from '../api/categories';
import { getAuthorsApi } from '../api/authors';
import type { AuthorResponse } from '../api/authors';
import { mapResponseToBook } from '../utils/bookHelper';
import BookCard from '../features/Book/BookCard/BookCard';
import type { Book } from '../models/Book';
import { useSeo } from '../hooks/useSeo';
import './BooksList.css';

function BooksList() {
  useSeo(
    'InkPulse Catalog - Khám phá kho sách lập trình & kiến trúc',
    'Tìm kiếm và lọc sách lập trình, thiết kế hệ thống phân tán, cơ sở dữ liệu cao cấp có tại InkPulse.'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedAuthor = searchParams.get('author') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  // Component local filter states (to prevent intermediate typing reloading)
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Sync inputs with URL changes
  useEffect(() => {
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Load static filter data (categories and authors)
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const catRes = await getCategoriesApi();
        if (catRes.data && catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories for filters:', err);
      }

      try {
        // Fetch top 15 authors
        const authRes = await getAuthorsApi({ pageSize: 15 });
        if (authRes.data && authRes.data.success) {
          setAuthors(authRes.data.data.items || []);
        }
      } catch (err) {
        console.error('Error fetching authors for filters:', err);
      }
    };

    fetchFilterData();
  }, []);

  // Main data fetcher
  const loadBooks = useCallback(async (page: number, append: boolean) => {
    setIsLoading(true);
    console.log('[DEBUG-FE] loadBooks called:', { page, append, minPriceParam, maxPriceParam });
    try {
      const activeFilters: any = {
        pageNumber: page,
        pageSize: 6,
        searchKeyword: keyword || undefined,
        categorySlug: selectedCategory || undefined,
        authorName: selectedAuthor || undefined,
        minPrice: minPriceParam ? parseInt(minPriceParam, 10) : undefined,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam, 10) : undefined,
      };
      console.log('[DEBUG-FE] activeFilters before API call:', activeFilters);

      // Set sorting directions
      if (sortBy === 'price_asc') {
        activeFilters.sortBy = 'price';
        activeFilters.sortDirection = 'asc';
      } else if (sortBy === 'price_desc') {
        activeFilters.sortBy = 'price';
        activeFilters.sortDirection = 'desc';
      } else if (sortBy === 'best_sellers') {
        activeFilters.sortBy = 'soldCount';
        activeFilters.sortDirection = 'desc';
      } else {
        activeFilters.sortBy = 'createdAt';
        activeFilters.sortDirection = 'desc';
      }

      // Remove undefined
      Object.keys(activeFilters).forEach(key => {
        if (activeFilters[key] === undefined) {
          delete activeFilters[key];
        }
      });

      console.log('[DEBUG-FE] Final activeFilters sent to getBooksApi:', activeFilters);
      const response = await getBooksApi(activeFilters);
      console.log('[DEBUG-FE] API response:', response.data);
      if (response.data && response.data.success && response.data.data) {
        const pagedList = response.data.data;
        const mappedBooks = pagedList.items.map((item: BookResponse) => mapResponseToBook(item));

        if (append) {
          setBooks(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const uniqueNew = mappedBooks.filter((b: Book) => !existingIds.has(b.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setBooks(mappedBooks);
        }
        setHasMore(pagedList.hasNext);
        setTotalCount(pagedList.totalCount);
      }
    } catch (err) {
      console.error('[DEBUG-FE] Error loading books list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedCategory, selectedAuthor, minPriceParam, maxPriceParam, sortBy]);

  // Reload when filters or keyword changes
  useEffect(() => {
    console.log('[DEBUG-FE] useEffect triggered: filters or keyword changed:', {
      keyword,
      selectedCategory,
      selectedAuthor,
      minPriceParam,
      maxPriceParam,
      sortBy
    });
    setPageNumber(1);
    loadBooks(1, false);
  }, [keyword, selectedCategory, selectedAuthor, minPriceParam, maxPriceParam, sortBy, loadBooks]);

  const handleLoadMore = () => {
    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    loadBooks(nextPage, true);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // reset pagination on filter change
    setSearchParams(params);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG-FE] handlePriceApply clicked:', { minPriceInput, maxPriceInput });
    
    // Check if parameters actually changed
    const isChanged = minPriceInput !== minPriceParam || maxPriceInput !== maxPriceParam;
    if (!isChanged) {
      console.log('[DEBUG-FE] Filter values unchanged. Triggering fake loading spin for UX feedback.');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return;
    }

    const params = new URLSearchParams(searchParams);
    if (minPriceInput) {
      params.set('minPrice', minPriceInput);
    } else {
      params.delete('minPrice');
    }
    if (maxPriceInput) {
      params.set('maxPrice', maxPriceInput);
    } else {
      params.delete('maxPrice');
    }
    console.log('[DEBUG-FE] Updated search params to set:', params.toString());
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    console.log('[DEBUG-FE] handleResetFilters clicked');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="books-list-container">
      <div className="books-layout">
        {/* Sidebar Filters */}
        <aside className="books-sidebar">
          <div className="sidebar-filter-section">
            <h3 className="filter-title">Danh mục</h3>
            <ul className="filter-list">
              <li 
                className={`filter-item ${!selectedCategory ? 'active' : ''}`}
                onClick={() => updateFilter('category', '')}
              >
                Tất cả danh mục
              </li>
              {categories.map(cat => (
                <li 
                  key={cat.id} 
                  className={`filter-item ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat.slug)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-filter-section">
            <h3 className="filter-title">Tác giả</h3>
            <ul className="filter-list">
              <li 
                className={`filter-item ${!selectedAuthor ? 'active' : ''}`}
                onClick={() => updateFilter('author', '')}
              >
                Tất cả tác giả
              </li>
              {authors.map(auth => (
                <li 
                  key={auth.id} 
                  className={`filter-item ${selectedAuthor === auth.name ? 'active' : ''}`}
                  onClick={() => updateFilter('author', auth.name)}
                >
                  {auth.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-filter-section">
            <h3 className="filter-title">Khoảng giá (VND)</h3>
            <form onSubmit={handlePriceApply} className="price-filter-form">
              <div className="price-input-row">
                <input 
                  type="number" 
                  placeholder="Từ..." 
                  className="price-input-field"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
                <span className="price-separator">-</span>
                <input 
                  type="number" 
                  placeholder="Đến..." 
                  className="price-input-field"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn-apply-price" 
                disabled={isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '44px' 
                }}
              >
                {isLoading ? (
                  <span className="btn-spinner"></span>
                ) : (
                  'Áp dụng'
                )}
              </button>
            </form>
          </div>

          <button onClick={handleResetFilters} className="btn-reset-filters">
            Xóa bộ lọc
          </button>
        </aside>

        {/* Content Area */}
        <main className="books-main-content">
          <div className="content-header">
            <div className="results-info">
              {keyword ? (
                <h2 className="search-status-title">
                  Kết quả cho: <span className="keyword-highlight">"{keyword}"</span>
                </h2>
              ) : (
                <h2 className="search-status-title">Tất cả sản phẩm</h2>
              )}
              <span className="results-count">Tìm thấy {totalCount} cuốn sách</span>
            </div>

            <div className="sort-bar">
              <span className="sort-label">Sắp xếp:</span>
              <div className="custom-dropdown-container" ref={dropdownRef}>
                <div
                  className={`custom-dropdown-header ${isSortOpen ? 'active' : ''}`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span>
                    {sortBy === 'newest' && 'Mới nhất'}
                    {sortBy === 'price_asc' && 'Giá: Thấp đến Cao'}
                    {sortBy === 'price_desc' && 'Giá: Cao đến Thấp'}
                    {sortBy === 'best_sellers' && 'Bán chạy nhất'}
                  </span>
                  <svg className={`arrow-icon ${isSortOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {isSortOpen && (
                  <div className="custom-dropdown-menu">
                    <div
                      className={`custom-dropdown-item ${sortBy === 'newest' ? 'selected' : ''}`}
                      onClick={() => { updateFilter('sortBy', 'newest'); setIsSortOpen(false); }}
                    >
                      Mới nhất
                    </div>
                    <div
                      className={`custom-dropdown-item ${sortBy === 'price_asc' ? 'selected' : ''}`}
                      onClick={() => { updateFilter('sortBy', 'price_asc'); setIsSortOpen(false); }}
                    >
                      Giá: Thấp đến Cao
                    </div>
                    <div
                      className={`custom-dropdown-item ${sortBy === 'price_desc' ? 'selected' : ''}`}
                      onClick={() => { updateFilter('sortBy', 'price_desc'); setIsSortOpen(false); }}
                    >
                      Giá: Cao đến Thấp
                    </div>
                    <div
                      className={`custom-dropdown-item ${sortBy === 'best_sellers' ? 'selected' : ''}`}
                      onClick={() => { updateFilter('sortBy', 'best_sellers'); setIsSortOpen(false); }}
                    >
                      Bán chạy nhất
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading && books.length === 0 ? (
            <div className="books-loading-skeleton">
              <span className="btn-spinner animate-spin"></span>
              <p style={{ marginTop: '14px', color: 'var(--text-muted)' }}>Đang tải danh sách sách...</p>
            </div>
          ) : books.length > 0 ? (
            <>
              <div className="book-grid">
                {books.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className="btn-load-more" 
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="btn-spinner"></span>
                    ) : (
                      'Xem thêm'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="books-empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <circle cx="12" cy="10" r="3"></circle>
                <line x1="12" y1="13" x2="12.01" y2="13"></line>
              </svg>
              <h3>Không tìm thấy cuốn sách nào</h3>
              <p>Vui lòng chọn từ khóa khác hoặc gỡ bỏ các tiêu chí bộ lọc của bạn.</p>
              <button onClick={handleResetFilters} className="btn-reset-filters-large">
                Gỡ bộ lọc & Xem tất cả sách
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default BooksList;
