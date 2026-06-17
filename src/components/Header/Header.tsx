import type { UserSession } from '../../types';
import './Header.css';

interface HeaderProps {
  isLoggedIn: boolean;
  user: UserSession | null;
  userDropdownActive: boolean;
  setUserDropdownActive: (active: boolean) => void;
  onNavigate: (page: 'home' | 'login' | 'profile' | 'book-detail') => void;
  logoutUser: () => void;
  coins: number;
}

function Header({
  isLoggedIn,
  user,
  userDropdownActive,
  setUserDropdownActive,
  onNavigate,
  logoutUser,
  coins,
}: HeaderProps) {
  return (
    <header>
      <div className="nav-container">
        <div className="logo" onClick={() => onNavigate('home')}>
          <img src="/ChatGPT Image Jun 14, 2026, 10_34_09 PM.png" alt="InkPulse" className="logo-img" />
        </div>

        <div className="header-search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            className="search-input"
          />
          <button className="search-btn">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <div className="nav-actions">
          {/* Giỏ hàng icon */}
          <div className="header-icon-wrap">
            <button className="header-icon-btn" onClick={() => alert('Giỏ hàng của bạn đang được nâng cấp!')}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="badge-count cart-badge">3</span>
            </button>
          </div>

          {/* Tài khoản icon */}
          <div className="header-icon-wrap">
            {!isLoggedIn ? (
              <button
                className="header-icon-btn"
                onClick={() => onNavigate('login')}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="badge-count coin-badge">{coins} xu</span>
              </button>
            ) : (
              <div className="user-widget">
                <button
                  className="header-icon-btn"
                  onClick={() => setUserDropdownActive(!userDropdownActive)}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="badge-count coin-badge">{coins} xu</span>
                </button>
                {userDropdownActive && (
                  <div className="user-dropdown">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{user?.username}</div>
                      <div className="dropdown-user-email">{user?.email}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-item" onClick={() => { onNavigate('profile'); setUserDropdownActive(false); }}>
                      👤 Trang cá nhân & Cài đặt
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-item">Số dư: {coins} xu</div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-item danger" onClick={logoutUser}>
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
