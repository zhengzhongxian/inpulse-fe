import './Footer.css';

function Footer() {
  return (
    <footer className="footer-premium">
      <div className="footer-container">
        {/* Brand & Socials */}
        <div className="footer-col brand-col">
          <div className="footer-logo-container">
            <img src="/ChatGPT Image Jun 14, 2026, 10_34_09 PM.png" alt="InkPulse" className="footer-logo-img" />
          </div>
          <p className="footer-tagline">
            Kho tàng tri thức khoa học máy tính, kiến trúc phân tán & giải pháp công nghệ cao hàng đầu.
          </p>
          <div className="footer-socials">
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* Youtube */}
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Youtube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="footer-col links-col">
          <h3>Khám Phá</h3>
          <ul className="footer-links">
            <li><a href="#books-list">Sách Lập Trình</a></li>
            <li><a href="#books-list">Hệ Thống & CQRS</a></li>
            <li><a href="#books-list">Cẩm Nang Bảo Mật</a></li>
            <li><a href="#books-list">Mã Nguồn Mở</a></li>
          </ul>
        </div>

        {/* Contact Info (Đại học Sư phạm TP.HCM) */}
        <div className="footer-col contact-col">
          <h3>Liên Hệ</h3>
          <ul className="footer-contact-details">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>(028) 3835 2020</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>webmaster@hcmup.edu.vn</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <a href="https://hcmue.edu.vn" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--primary)' }}>hcmue.edu.vn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 InkPulse Bookstore. Mọi quyền được bảo lưu. Thiết kế dành riêng cho hệ thống của Hiển.</p>
      </div>
    </footer>
  );
}

export default Footer;
