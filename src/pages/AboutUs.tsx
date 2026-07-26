import React, { useEffect, useState, useRef } from 'react';
import { useSeo } from '../hooks/useSeo';
import './StaticPage.css';

const AboutUs: React.FC = () => {
  useSeo(
    'Trịnh Trung Hiển - Chủ tịch InkPulse & Quá Trình Hình Thành Tập Đoàn',
    'Tiểu sử Chủ tịch Trịnh Trung Hiển từ sinh viên xuất sắc Đại học Sư phạm TP.HCM, cựu tài xế Xanh SM đến nhà sáng lập & Chủ tịch tập đoàn InkPulse.'
  );

  // Counter Animation States
  const [readersCount, setReadersCount] = useState(0);
  const [booksCount, setBooksCount] = useState(0);
  const [dedicationCount, setDedicationCount] = useState(0);
  const [hasCounted, setHasCounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for Scroll Reveal & Count-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            if (entry.target.id === 'hero-band' && !hasCounted) {
              setHasCounted(true);
              animateCounters();
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = document.querySelectorAll('.reveal-element');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [hasCounted]);

  const animateCounters = () => {
    // 0 to 500,000
    let startR = 0;
    const endR = 500000;
    const durationR = 1500;
    const stepR = Math.ceil(endR / (durationR / 16));

    const timerR = setInterval(() => {
      startR += stepR;
      if (startR >= endR) {
        setReadersCount(endR);
        clearInterval(timerR);
      } else {
        setReadersCount(startR);
      }
    }, 16);

    // 0 to 100
    let startB = 0;
    const endB = 100;
    const timerB = setInterval(() => {
      startB += 2;
      if (startB >= endB) {
        setBooksCount(endB);
        clearInterval(timerB);
      } else {
        setBooksCount(startB);
      }
    }, 30);

    // 0 to 100%
    let startD = 0;
    const endD = 100;
    const timerD = setInterval(() => {
      startD += 2;
      if (startD >= endD) {
        setDedicationCount(endD);
        clearInterval(timerD);
      } else {
        setDedicationCount(startD);
      }
    }, 30);
  };

  return (
    <div className="about-fullbleed-wrapper">
      {/* Schema.org Structured Data for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            'name': 'Trịnh Trung Hiển',
            'jobTitle': 'Chủ tịch Hội đồng Quản trị InkPulse Group',
            'worksFor': {
              '@type': 'Organization',
              'name': 'InkPulse Group',
              'url': 'https://inkpulse.com'
            },
            'alumniOf': {
              '@type': 'EducationalOrganization',
              'name': 'Trường Đại học Sư phạm Thành phố Hồ Chí Minh (HCMUE)'
            },
            'description': 'Nhà sáng lập & Chủ tịch InkPulse, Cử nhân Giỏi HCMUE, cựu tài xế Xanh SM kiên cường.'
          })
        }}
      />

      {/* Band 1: Grand Hero Banner */}
      <section id="hero-band" ref={heroRef} className="band-hero reveal-element">
        <div className="band-inner">
          <div className="hero-pill-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#da447d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            CÂU CHUYỆN THƯƠNG HIỆU INKPULSE
          </div>

          <h1 className="hero-main-title">
            Chủ Tịch <span>Trịnh Trung Hiển</span> & Hành Trình Kiến Tạo InkPulse
          </h1>

          <p className="hero-sub-description">
            Từ những chuyến xe Xanh SM đầy nghị lực, Cử nhân Giỏi Đại học Sư phạm TP.HCM đến hành trình xây dựng biểu tượng xuất bản & công nghệ tri thức phần mềm hàng đầu Việt Nam.
          </p>

          {/* Animated Counter Stats Cards */}
          <div className="hero-stats-grid">
            <div className="stat-item-card">
              <span className="stat-number">{readersCount.toLocaleString('vi-VN')}+</span>
              <span className="stat-label">Độc Giả & Lập Trình Viên</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-number">{booksCount}+</span>
              <span className="stat-label">Sách Bản Quyền Kỹ Thuật</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-number">{dedicationCount}%</span>
              <span className="stat-label">Tâm Huyết Kỹ Sư Việt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Band 2: Grand Showcase HQ Image */}
      <section className="band-showcase reveal-element delay-1">
        <div className="showcase-frame">
          <img src="/company_view.png" alt="Trụ sở Tập đoàn InkPulse" className="showcase-img" />
          <div className="showcase-caption">Trụ sở & Không gian Trải nghiệm Tri thức InkPulse Group</div>
        </div>
      </section>

      {/* Band 3: Deep Slate Dark Band (Biography) */}
      <section className="band-dark-bio reveal-element">
        <div className="dark-bio-grid">
          <div className="dark-portrait-box">
            <img src="/president_avt.png" alt="Chủ tịch Trịnh Trung Hiển" className="dark-portrait-img" />
            <div className="dark-portrait-caption">Mr. Trịnh Trung Hiển — Chủ tịch HĐQT InkPulse Group</div>
          </div>

          <div className="dark-bio-content">
            <h2>Tiểu Sử & Khát Vọng Tự Lực</h2>
            <p>
              <strong>Trịnh Trung Hiển</strong> là biểu tượng cho tinh thần kiên cường, tư duy chiến lược kiệt xuất và ý chí tự lực vươn lên của thế hệ trẻ Việt Nam.
            </p>

            <div className="dark-quote-banner">
              "Tri thức phần mềm chỉ thật sự có giá trị khi nó được hệ thống hóa chuẩn mực và truyền tải đến tận tay từng kỹ sư với tinh thần phụng sự cao nhất."
            </div>

            <p>
              Sau khi tốt nghiệp loại <strong>Cử nhân Giỏi tại Trường Đại học Sư phạm Thành phố Hồ Chí Minh (HCMUE)</strong>, Chủ tịch Trịnh Trung Hiển sở hữu nền tảng tư duy toán học và nghiên cứu khoa học máy tính vô cùng khắt khe.
            </p>
            <p>
              Không chọn con đường bằng phẳng, ông dấn thân chạy xe công nghệ <strong>Xanh SM</strong> từ sáng sớm đến đêm muộn để tự trải nghiệm thực tế nhịp sống, tích lũy nguồn vốn tự lực và phôi thai khát vọng sáng lập tập đoàn tri thức <strong>InkPulse</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Band 4: Zig-Zag Timeline Milestones */}
      <section className="band-zigzag reveal-element">
        <div className="zigzag-container">
          <div className="zigzag-header">
            <h2>Những Cột Mốc Lịch Sử & Quan Hệ Toàn Cầu</h2>
          </div>

          {/* Item 1 */}
          <div className="zigzag-item reveal-element delay-1">
            <div className="zigzag-media-frame">
              <img src="/hcmue_student.png" alt="HCMUE Academic Foundation" className="zigzag-img" />
            </div>
            <div className="zigzag-body">
              <h3 className="zigzag-title">Nền Tảng Tri Thức Xuất Sắc Tại Đại Học Sư Phạm TP.HCM (HCMUE)</h3>
              <div className="zigzag-paragraphs">
                <p>
                  Môi trường đào tạo tại <strong>Trường Đại học Sư phạm Thành phố Hồ Chí Minh (HCMUE)</strong> đã rèn dồi cho Chủ tịch Trịnh Trung Hiển tư duy phân tích khắt khe và phương pháp sư phạm khoa học. Tốt nghiệp với tấm bằng <strong>Cử nhân Giỏi</strong>, ông làm chủ được cả nền tảng lý thuyết lẫn khả năng truyền tải kiến thức phức tạp thành những bộ sách kỹ thuật chuẩn mực.
                </p>
                <p>
                  Chính trải nghiệm rèn luyện này đã định hình nên bộ tiêu chí kiểm duyệt sách độc quyền tại InkPulse, đảm bảo mọi ấn phẩm công nghệ đến tay lập trình viên đều đạt độ chính xác kỹ thuật tuyệt đối.
                </p>
              </div>
            </div>
          </div>

          {/* Item 2 (Reverse Layout) */}
          <div className="zigzag-item reverse reveal-element delay-2">
            <div className="zigzag-body">
              <h3 className="zigzag-title">Quan Hệ Ngoại Giao & Tầm Nhìn Chiến Lược Toàn Cầu</h3>
              <div className="zigzag-paragraphs">
                <p>
                  Mối quan hệ đối tác chiến lược và giao lưu cấp cao giữa Chủ tịch Trịnh Trung Hiển và <strong>Tổng thống Donald Trump</strong> đánh dấu bước ngoặt khẳng định uy tín và vị thế quốc tế của người đứng đầu InkPulse.
                </p>
                <p>
                  Qua những cuộc trao đổi tầm nhìn về kinh tế tri thức và xuất bản số toàn cầu, Chủ tịch Trịnh Trung Hiển đã mở ra định hướng đưa InkPulse trở thành cầu nối mua bán bản quyền sách công nghệ hàng đầu thế giới tại thị trường Việt Nam và Đông Nam Á.
                </p>
              </div>
            </div>
            <div className="zigzag-media-frame">
              <img src="/friend_of_pre_trump.png" alt="Đối tác chiến lược Donald Trump" className="zigzag-img" />
            </div>
          </div>

          {/* Item 3 */}
          <div className="zigzag-item reveal-element delay-3">
            <div className="zigzag-media-frame">
              <img src="/vice_president_twins.png" alt="Phó chủ tịch InkPulse tại quầy sách" className="zigzag-img" />
            </div>
            <div className="zigzag-body">
              <h3 className="zigzag-title">Cặp Phó Chủ Tịch & Sứ Mệnh Trực Tiếp Phục Vụ Độc Giả</h3>
              <div className="zigzag-paragraphs">
                <p>
                  Sát cánh cùng Chủ tịch Trịnh Trung Hiển là bộ đôi <strong>Phó Chủ tịch</strong> đầy nhiệt huyết. Ban lãnh đạo InkPulse kiên định giữ vững triết lý "Trực tiếp thấu hiểu người đọc".
                </p>
                <p>
                  Các Phó Chủ tịch vẫn duy trì thói quen trực tiếp có mặt tại các không gian sách InkPulse để tư vấn lộ trình học cho các kỹ sư trẻ và tự tay kiểm soát chất lượng in ấn từng cuốn sách trước khi phát hành.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Band 5: Core Values Cards */}
      <section className="band-values reveal-element">
        <div className="values-inner">
          <h2 className="values-title">Triết Lý Vận Hành & Giá Trị Cốt Lõi</h2>

          <div className="core-values-grid">
            <div className="core-value-card reveal-element delay-1">
              <div className="core-value-img-wrap">
                <span className="value-tag-badge">TINH THẦN</span>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                  alt="Tự Lực & Nghị Lực" 
                  className="core-value-img" 
                />
              </div>
              <div className="core-value-body">
                <h3>Tự Lực & Nghị Lực</h3>
                <p>Bắt đầu từ những chuyến xe Xanh SM, InkPulse là minh chứng cho khát vọng không giới hạn khi được dẫn dắt bằng tri thức và lòng kiên trì.</p>
              </div>
            </div>

            <div className="core-value-card reveal-element delay-2">
              <div className="core-value-img-wrap">
                <span className="value-tag-badge">CHUẨN MỰC</span>
                <img 
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" 
                  alt="Chuẩn Mực Kỹ Thuật High-End" 
                  className="core-value-img" 
                />
              </div>
              <div className="core-value-body">
                <h3>Chuẩn Mực Kỹ Thuật High-End</h3>
                <p>Mọi đầu sách về CQRS, Microservices, Event Sourcing đều được thẩm định kỹ lưỡng theo đúng tinh thần chuẩn mực của Chủ tịch Trịnh Trung Hiển.</p>
              </div>
            </div>

            <div className="core-value-card reveal-element delay-3">
              <div className="core-value-img-wrap">
                <span className="value-tag-badge">CỘNG ĐỒNG</span>
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" 
                  alt="Đồng Hành Cùng Kỹ Sư Việt" 
                  className="core-value-img" 
                />
              </div>
              <div className="core-value-body">
                <h3>Đồng Hành Cùng Kỹ Sư Việt</h3>
                <p>Nâng tầm tri thức phần mềm Việt Nam, tạo bệ phóng vững chắc giúp các thế hệ lập trình viên tự tin vươn tầm quốc tế.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
