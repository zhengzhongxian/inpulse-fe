import { useState } from 'react';
import { toast } from 'react-toastify';
import type { UserSession } from '../../types';
import './Profile.css';

interface ProfileProps {
  user: UserSession | null;
  onUpdateUser: (updatedUser: Partial<UserSession>) => void;
}

function Profile({ user, onUpdateUser }: ProfileProps) {
  // Sidebar tab control
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

  // Local state for profile fields (mocked values from User / UserProfile backend entities)
  const [firstName, setFirstName] = useState<string>('Hiển');
  const [lastName, setLastName] = useState<string>('Lê');
  const [fullName, setFullName] = useState<string>('Lê Trung Hiển');
  const [phone, setPhone] = useState<string>('0908123456');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dob, setDob] = useState<string>('2000-01-01');
  const [bio, setBio] = useState<string>('Đam mê xây dựng các hệ thống backend phân tán cấu trúc cao, CQRS và trải nghiệm frontend hiện đại.');
  const [timezone, setTimezone] = useState<string>('Asia/Ho_Chi_Minh');

  // Local state for settings (from UserSetting backend entity)
  const [displayMode, setDisplayMode] = useState<'LIGHT' | 'DARK' | 'SYSTEM'>(
    (user?.displayMode as 'LIGHT' | 'DARK' | 'SYSTEM') || 'SYSTEM'
  );
  const [language, setLanguage] = useState<'VI' | 'EN'>((user?.choiceLanguage as 'VI' | 'EN') || 'VI');
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(true);

  // Handle Save Info (No form tags used)
  const handleSaveInfo = () => {
    // Simple validation
    if (!firstName || !lastName || !fullName) {
      toast.error('Họ tên không được để trống.');
      return;
    }

    // Update in parent session state if logged in
    if (user) {
      onUpdateUser({
        username: user.username
      });
    }

    toast.success('Lưu thông tin cá nhân thành công!');
  };

  // Handle Save Settings
  const handleSaveSettings = () => {
    if (user) {
      onUpdateUser({
        displayMode,
        choiceLanguage: language
      });
    }

    toast.success('Cập nhật cài đặt hệ thống thành công!');
  };

  const handleMfaToggle = (checked: boolean) => {
    setMfaEnabled(checked);
    toast.info(`Đã ${checked ? 'bật' : 'tắt'} xác thực 2 lớp (MFA).`);
  };

  return (
    <div className="profile-wrapper">
      <h1 className="profile-title-main">Quản lý Tài khoản</h1>

      <div className="profile-container">
        {/* Left Sidebar Info Card */}
        <aside className="profile-sidebar">
          <div className="profile-user-summary">
            <div className="profile-avatar-large">
              {user?.username ? user.username.substring(0, 1).toUpperCase() : 'H'}
            </div>
            <h3 className="profile-username">{fullName || user?.username || 'Khách'}</h3>
            <p className="profile-email">{user?.email || 'guest@inkpulse.com'}</p>
          </div>

          <nav className="profile-nav-list">
            <button
              className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              👤 Thông tin cá nhân
            </button>
            <button
              className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Cài đặt hệ thống
            </button>
          </nav>
        </aside>

        {/* Right Main Content */}
        <div className="profile-content">
          {activeTab === 'info' && (
            <div>
              <h2 className="profile-section-title">Thông tin cá nhân</h2>
              
              <div className="profile-fields-grid">
                <div className="profile-field-group">
                  <span className="profile-field-label">Tên</span>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nhập tên..."
                  />
                </div>

                <div className="profile-field-group">
                  <span className="profile-field-label">Họ</span>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nhập họ..."
                  />
                </div>

                <div className="profile-field-group">
                  <span className="profile-field-label">Họ và Tên đầy đủ</span>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên đầy đủ..."
                  />
                </div>

                <div className="profile-field-group">
                  <span className="profile-field-label">Số điện thoại</span>
                  <input
                    type="tel"
                    className="profile-field-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại..."
                  />
                </div>

                <div className="profile-field-group">
                  <span className="profile-field-label">Giới tính</span>
                  <select
                    className="profile-field-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <span className="profile-field-label">Ngày sinh</span>
                  <input
                    type="date"
                    className="profile-field-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                <div className="profile-field-group">
                  <span className="profile-field-label">Múi giờ (Timezone)</span>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Múi giờ..."
                  />
                </div>

                <div className="profile-field-group full-width">
                  <span className="profile-field-label">Giới thiệu bản thân</span>
                  <textarea
                    className="profile-field-input"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Nhập mô tả giới thiệu bản thân..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn-primary" onClick={handleSaveInfo}>
                  Lưu thông tin
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="profile-section-title">Cài đặt hệ thống</h2>

              <div className="settings-list">
                {/* Theme Setting */}
                <div className="settings-row">
                  <div className="settings-info">
                    <span className="settings-label">Chế độ hiển thị (Theme)</span>
                    <span className="settings-desc">Thay đổi giao diện màu sắc của hệ thống sang chế độ Sáng, Tối hoặc tự động theo hệ điều hành.</span>
                  </div>
                  <div className="settings-control">
                    <select
                      className="profile-field-select"
                      value={displayMode}
                      onChange={(e) => setDisplayMode(e.target.value as any)}
                    >
                      <option value="SYSTEM">Hệ thống (System)</option>
                      <option value="LIGHT">Sáng (Light Mode)</option>
                      <option value="DARK">Tối (Dark Mode)</option>
                    </select>
                  </div>
                </div>

                {/* Language Setting */}
                <div className="settings-row">
                  <div className="settings-info">
                    <span className="settings-label">Ngôn ngữ hiển thị</span>
                    <span className="settings-desc">Chọn ngôn ngữ bạn muốn sử dụng trên giao diện của InkPulse Bookstore.</span>
                  </div>
                  <div className="settings-control">
                    <select
                      className="profile-field-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                    >
                      <option value="VI">Tiếng Việt (VI)</option>
                      <option value="EN">English (EN)</option>
                    </select>
                  </div>
                </div>

                {/* MFA Security Setting */}
                <div className="settings-row">
                  <div className="settings-info">
                    <span className="settings-label">Xác thực 2 lớp (MFA)</span>
                    <span className="settings-desc">Bật xác thực bảo mật 2 lớp qua Email OTP, Google Authenticator hoặc Push Prompt để bảo vệ tài khoản tốt hơn.</span>
                  </div>
                  <div className="settings-control">
                    <label className="switch-control">
                      <input
                        type="checkbox"
                        checked={mfaEnabled}
                        onChange={(e) => handleMfaToggle(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn-primary" onClick={handleSaveSettings}>
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
