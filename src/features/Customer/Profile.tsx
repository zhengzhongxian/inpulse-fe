import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  getUserProfileApi, 
  updateUserProfileApi, 
  createUserAddressApi, 
  updateUserAddressApi, 
  deleteUserAddressApi, 
  changePasswordApi 
} from '../../api/auth';
import { getProvincesApi, getDistrictsApi, getWardsApi } from '../../api/address';
import './Profile.css';

function Profile() {
  const {
    user,
    setUser,
    setIsLoggedIn,
    logoutUser: onLogout,
  } = useAuth();

  // Navigation tab control
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'password'>('info');

  // Local state for profile fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('OTHER');
  const [dob, setDob] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('Asia/Ho_Chi_Minh');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [mfaTypes, setMfaTypes] = useState<string[]>([]);

  // Avatar upload file reference
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for settings
  const [displayMode, setDisplayMode] = useState<'LIGHT' | 'DARK' | 'SYSTEM'>('SYSTEM');
  const [language, setLanguage] = useState<'VI' | 'EN'>('VI');
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isSavingInfo, setIsSavingInfo] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);

  // Address Manager Modal States
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  // Address Form Fields
  const [formLabel, setFormLabel] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formStreet, setFormStreet] = useState<string>('');

  // GHN Cascade Select Data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  // Dropdown references for outside click handling
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayModeRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);

  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);
  const [showDisplayModeDropdown, setShowDisplayModeDropdown] = useState<boolean>(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState<boolean>(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState<boolean>(false);
  const [showWardDropdown, setShowWardDropdown] = useState<boolean>(false);

  // Custom Date Picker references and states
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [viewMonth, setViewMonth] = useState<number>(() => dob ? new Date(dob).getMonth() : new Date().getMonth());
  const [viewYear, setViewYear] = useState<number>(() => dob ? new Date(dob).getFullYear() : new Date().getFullYear());

  // Fetch initial profile and GHN provinces
  useEffect(() => {
    const initData = async () => {
      try {
        const profileRes = await getUserProfileApi();
        const data = profileRes.data.data;
        if (data) {
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          setGender(data.gender || 'OTHER');
          setDob(data.dob || '');
          setAvatarUrl(data.avatarUrl || '');
          setBio(data.biography || '');
          setTimezone(data.timezone || 'Asia/Ho_Chi_Minh');
          setAddresses(data.addresses || []);

          setDisplayMode(data.displayMode || 'SYSTEM');
          setLanguage(data.choiceLanguage || 'VI');
          setMfaEnabled(data.mfaEnabled || false);
          setMfaTypes(data.mfaTypes || []);
        }

        const provRes = await getProvincesApi();
        setProvinces(provRes.data?.data || []);
      } catch (err: any) {
        console.error(err);
        toast.error('Không thể tải dữ liệu cá nhân.');
      }
    };
    initData();
  }, []);

  // Outside click listener for custom select boxes
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowGenderDropdown(false);
      }
      if (displayModeRef.current && !displayModeRef.current.contains(e.target as Node)) {
        setShowDisplayModeDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(e.target as Node)) {
        setShowWardDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle cascading GHN selectors
  const handleProvinceChange = async (provId: number) => {
    setSelectedProvince(provId);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    if (!provId) return;
    try {
      const res = await getDistrictsApi(provId);
      setDistricts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách quận huyện.');
    }
  };

  const handleDistrictChange = async (distId: number) => {
    setSelectedDistrict(distId);
    setSelectedWard(null);
    setWards([]);
    if (!distId) return;
    try {
      const res = await getWardsApi(distId);
      setWards(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách phường xã.');
    }
  };

  // Open address editor inside modal
  const handleOpenAddressForm = async (addr?: any) => {
    if (addr) {
      setEditingAddress(addr);
      setFormLabel(addr.addressLabel || '');
      setFormPhone(addr.recipientPhone || '');
      setFormStreet(addr.streetAddress || '');

      setSelectedProvince(addr.provinceId);
      try {
        const distRes = await getDistrictsApi(addr.provinceId);
        setDistricts(distRes.data?.data || []);
        setSelectedDistrict(addr.districtId);

        const wardRes = await getWardsApi(addr.districtId);
        setWards(wardRes.data?.data || []);
        setSelectedWard(addr.wardCode);
      } catch (e) {
        console.error(e);
      }
    } else {
      setEditingAddress(null);
      setFormLabel('');
      setFormPhone('');
      setFormStreet('');
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
    }
    setShowAddressForm(true);
  };

  // Save address (Create or Update)
  const handleSaveAddress = async () => {
    if (!formLabel.trim() || !formPhone.trim() || !formStreet.trim() || !selectedProvince || !selectedDistrict || !selectedWard) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }

    const provinceName = provinces.find(p => p.provinceId === selectedProvince)?.provinceName || '';
    const districtName = districts.find(d => d.districtId === selectedDistrict)?.districtName || '';
    const wardName = wards.find(w => w.wardCode === selectedWard)?.wardName || '';

    const payload = {
      addressLabel: formLabel,
      recipientPhone: formPhone,
      provinceId: selectedProvince,
      provinceName,
      districtId: selectedDistrict,
      districtName,
      wardCode: selectedWard,
      wardName,
      streetAddress: formStreet,
    };

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await updateUserAddressApi(editingAddress.id, payload);
        toast.success('Cập nhật địa chỉ thành công.');
      } else {
        await createUserAddressApi(payload);
        toast.success('Thêm địa chỉ thành công.');
      }

      // Reload profile to update address lists
      const profileRes = await getUserProfileApi();
      setAddresses(profileRes.data.data?.addresses || []);
      setShowAddressForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await deleteUserAddressApi(id);
      toast.success('Xóa địa chỉ thành công.');
      const profileRes = await getUserProfileApi();
      setAddresses(profileRes.data.data?.addresses || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi khi xóa địa chỉ.');
    }
  };

  // Handle Save Profile Info
  const handleSaveInfo = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Họ và Tên không được để trống.');
      return;
    }

    setIsSavingInfo(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('gender', gender);
      if (dob) formData.append('dob', dob);
      formData.append('biography', bio);
      formData.append('timezone', timezone);

      if (avatarFile) {
        formData.append('avatarFile', avatarFile);
      }

      const res = await updateUserProfileApi(formData);
      setUser(res.data.data);
      setAvatarFile(null);
      toast.success('Lưu thông tin cá nhân thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lưu thông tin cá nhân thất bại.');
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async () => {
    if (mfaEnabled && mfaTypes.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phương thức xác thực 2 lớp.');
      return;
    }
    setIsSavingSettings(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('gender', gender);
      if (dob) formData.append('dob', dob);
      formData.append('biography', bio);
      formData.append('timezone', timezone);
      formData.append('displayMode', displayMode);
      formData.append('choiceLanguage', language);
      
      const activeMfaTypes = mfaEnabled ? mfaTypes : [];
      if (activeMfaTypes.length === 0) {
        // Send an empty value so the backend receives an empty list and disables MFA,
        // rather than receiving null which is ignored.
        formData.append('mfaTypes', '');
      } else {
        activeMfaTypes.forEach(t => formData.append('mfaTypes', t));
      }

      const res = await updateUserProfileApi(formData);
      setUser(res.data.data);
      setMfaEnabled(res.data.data.mfaEnabled || false);
      setMfaTypes(res.data.data.mfaTypes || []);
      toast.success('Lưu cài đặt hệ thống thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lưu cài đặt thất bại.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Change Password
  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đủ các trường mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordApi({
        oldPassword: oldPassword,
        newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMismatch(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thay đổi mật khẩu thất bại.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  // Custom Gender Options
  const genderOptions = [
    {
      value: 'MALE', label: 'Nam', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <circle cx="10" cy="14" r="5"></circle>
          <line x1="19" y1="5" x2="13.6" y2="10.4"></line>
          <polyline points="19 11 19 5 13 5"></polyline>
        </svg>
      )
    },
    {
      value: 'FEMALE', label: 'Nữ', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <circle cx="12" cy="8" r="5"></circle>
          <line x1="12" y1="13" x2="12" y2="21"></line>
          <line x1="9" y1="17" x2="15" y2="17"></line>
        </svg>
      )
    },
    {
      value: 'OTHER', label: 'Khác', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12h8"></path>
          <path d="M12 8v8"></path>
        </svg>
      )
    }
  ];

  // Custom Date picker lists setup
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setDob(`${viewYear}-${m}-${d}`);
    setShowDatePicker(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Chọn ngày sinh...';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const yearOptionsList = [];
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= 1900; y--) {
    yearOptionsList.push(y);
  }

  // Display Mode custom select options
  const displayModeOptions = [
    { value: 'SYSTEM', label: 'Hệ thống' },
    { value: 'LIGHT', label: 'Sáng' },
    { value: 'DARK', label: 'Tối' }
  ];

  // Language custom select options
  const languageOptions = [
    { value: 'VI', label: 'Tiếng Việt' },
    { value: 'EN', label: 'Tiếng Anh' }
  ];

  return (
    <div className="profile-wrapper">
      <h1 className="profile-title-main">Quản lý Tài khoản</h1>

      {/* Top Header Navigation */}
      <div className="profile-tabs-header">
        <button
          className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Thông tin cá nhân
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Cài đặt hệ thống
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Content Body */}
      <div className="profile-main-body">
        {activeTab === 'info' && (
          <div className="profile-section-fade">
            {/* Centered Avatar only (no text next to it) */}
            <div className="profile-avatar-section" style={{ justifyContent: 'center' }}>
              <div className="profile-avatar-container" onClick={handleAvatarClick}>
                <img
                  src={avatarUrl.startsWith('avatar/') 
                    ? `http://avatar.inkpulse.com/${avatarUrl}` 
                    : avatarUrl || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.username || 'default'}`}
                  alt="Avatar"
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.username || 'default'}`;
                  }}
                />
                <div className="profile-avatar-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Profile Input Grid */}
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
                <span className="profile-field-label">Email</span>
                <input
                  type="text"
                  className="profile-field-input email-input-readonly"
                  value={email}
                  readOnly
                />
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">Múi giờ</span>
                <input
                  type="text"
                  className="profile-field-input timezone-input-readonly"
                  value={timezone === 'Asia/Ho_Chi_Minh' ? 'Việt Nam (UTC+07:00)' : timezone}
                  readOnly
                  placeholder="Múi giờ..."
                />
              </div>

              {/* Custom Datepicker (preserved as requested) */}
              <div className="profile-field-group" ref={datePickerRef} style={{ position: 'relative' }}>
                <span className="profile-field-label">Ngày sinh</span>
                <div
                  className="profile-field-input"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: '#FFFFFF',
                    paddingRight: '40px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span style={{ color: dob ? 'var(--text-main)' : 'var(--text-light)', fontSize: '14px' }}>
                      {formatDateDisplay(dob)}
                    </span>
                  </div>
                  <svg 
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    style={{ position: 'absolute', right: '14px', top: '50%', transition: 'transform 0.2s ease', transformOrigin: 'center', transform: showDatePicker ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {showDatePicker && (
                  <div
                    className="custom-date-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '280px',
                      zIndex: 100,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-dark)',
                      padding: '16px',
                      marginTop: '4px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      animation: 'fadeIn 0.2s ease'
                    }}
                  >
                    {/* Month and Year navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '4px' }}>
                      <button type="button" onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <select
                          value={viewMonth}
                          onChange={(e) => setViewMonth(Number(e.target.value))}
                          style={{ border: '1px solid var(--border-dark)', fontSize: '13px', padding: '2px 4px', borderRadius: '0', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
                        >
                          {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={viewYear}
                          onChange={(e) => setViewYear(Number(e.target.value))}
                          style={{ border: '1px solid var(--border-dark)', fontSize: '13px', padding: '2px 4px', borderRadius: '0', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
                        >
                          {yearOptionsList.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <button type="button" onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font)' }}>
                      {weekdays.map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                      {Array.from({ length: firstDayIndex }).map((_, idx) => (
                        <div key={`empty-${idx}`} style={{ height: '28px' }}></div>
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const day = idx + 1;
                        const isSelected = dob &&
                          new Date(dob).getDate() === day &&
                          new Date(dob).getMonth() === viewMonth &&
                          new Date(dob).getFullYear() === viewYear;

                        return (
                          <div
                            key={day}
                            onClick={() => selectDay(day)}
                            style={{
                              height: '28px',
                              lineHeight: '28px',
                              fontSize: '13px',
                              fontWeight: isSelected ? '700' : '400',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                              color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                              transition: 'background-color 0.15s ease',
                              borderRadius: '0',
                              fontFamily: 'var(--font)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Gender Select Box styled matching the reference image */}
              <div className="profile-field-group" ref={dropdownRef} style={{ position: 'relative' }}>
                <span className="profile-field-label">Giới tính</span>
                <div
                  className="custom-select-trigger"
                  onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {genderOptions.find(o => o.value === gender)?.icon}
                    <span className="selected-value-text">
                      {genderOptions.find(o => o.value === gender)?.label}
                    </span>
                  </div>
                  <svg 
                    className={`chevron-icon ${showGenderDropdown ? 'open' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {showGenderDropdown && (
                  <div className="custom-select-dropdown">
                    {genderOptions.map(option => (
                      <div
                        key={option.value}
                        className={`custom-select-option ${gender === option.value ? 'selected' : ''}`}
                        onClick={() => {
                          setGender(option.value as any);
                          setShowGenderDropdown(false);
                        }}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="profile-field-group full-width">
                <span className="profile-field-label">Giới thiệu bản thân</span>
                <textarea
                  className="profile-field-input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Nhập mô tả giới thiệu bản thân..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Delivery Addresses Section - displaying up to 4 addresses */}
            <div className="profile-addresses-section" style={{ marginTop: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                  Địa chỉ giao hàng
                </h3>
                <button 
                  type="button"
                  className="btn-view-details"
                  onClick={() => setShowAddressModal(true)}
                >
                  Xem chi tiết
                </button>
              </div>

              {addresses && addresses.length > 0 ? (
                <div className="address-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {addresses.slice(0, 4).map((addr, index) => (
                    <div
                      key={addr.id || index}
                      className="address-card"
                      style={{
                        padding: '16px',
                        border: index === 0 ? '1.5px solid var(--primary)' : '1px solid var(--border-dark)',
                        backgroundColor: index === 0 ? '#fdf2f5' : '#ffffff',
                        borderRadius: '0px', /* No border-radius as requested */
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14.5px' }}>
                          {addr.addressLabel || 'Địa chỉ'}
                        </span>
                        {index === 0 && (
                          <span style={{
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '3px'
                          }}>
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>Số điện thoại:</strong> <span style={{ color: '#2563eb', fontWeight: '600' }}>{addr.recipientPhone}</span>
                        </p>
                        <p style={{ margin: '0' }}>
                          <strong>Địa chỉ:</strong> <span style={{ color: '#16a34a', fontWeight: '500' }}>{addr.streetAddress}, {addr.wardName}, {addr.districtName}, {addr.provinceName}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Chưa có địa chỉ nào được đăng ký.</p>
              )}
            </div>

            {/* Actions Footer */}
            <div className="profile-actions">
              {onLogout && (
                <button className="btn-logout-icon" onClick={onLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                  <span className="logout-text">Đăng xuất</span>
                </button>
              )}
              <button 
                className="btn-primary" 
                onClick={handleSaveInfo}
                disabled={isSavingInfo}
                style={{ position: 'relative' }}
              >
                {isSavingInfo && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <div className="spinner-loader" style={{ margin: 0 }} />
                  </div>
                )}
                <div style={{ opacity: isSavingInfo ? 0 : 1 }}>
                  Lưu thông tin
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="profile-section-fade">
            <div className="settings-list">
              {/* Theme Settings Custom Selector */}
              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label settings-label-theme">Chế độ hiển thị</span>
                  <span className="settings-desc">Thay đổi giao diện màu sắc của hệ thống sang chế độ Sáng, Tối hoặc tự động theo hệ điều hành.</span>
                </div>
                <div className="settings-control" ref={displayModeRef} style={{ position: 'relative' }}>
                  <div
                    className="custom-select-trigger"
                    onClick={() => setShowDisplayModeDropdown(!showDisplayModeDropdown)}
                  >
                    <span className="selected-value-text">
                      {displayModeOptions.find(o => o.value === displayMode)?.label}
                    </span>
                    <svg 
                      className={`chevron-icon ${showDisplayModeDropdown ? 'open' : ''}`}
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {showDisplayModeDropdown && (
                    <div className="custom-select-dropdown">
                      {displayModeOptions.map(option => (
                        <div
                          key={option.value}
                          className={`custom-select-option ${displayMode === option.value ? 'selected' : ''}`}
                          onClick={() => {
                            setDisplayMode(option.value as any);
                            setShowDisplayModeDropdown(false);
                          }}
                        >
                          <span>{option.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Language Settings Custom Selector */}
              <div className="settings-row">
                <div className="settings-info">
                  <span className="settings-label settings-label-lang">Ngôn ngữ hiển thị</span>
                  <span className="settings-desc">Chọn ngôn ngữ bạn muốn sử dụng trên giao diện của InkPulse Bookstore.</span>
                </div>
                <div className="settings-control" ref={languageRef} style={{ position: 'relative' }}>
                  <div
                    className="custom-select-trigger"
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  >
                    <span className="selected-value-text">
                      {languageOptions.find(o => o.value === language)?.label}
                    </span>
                    <svg 
                      className={`chevron-icon ${showLanguageDropdown ? 'open' : ''}`}
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {showLanguageDropdown && (
                    <div className="custom-select-dropdown">
                      {languageOptions.map(option => (
                        <div
                          key={option.value}
                          className={`custom-select-option ${language === option.value ? 'selected' : ''}`}
                          onClick={() => {
                            setLanguage(option.value as any);
                            setShowLanguageDropdown(false);
                          }}
                        >
                          <span>{option.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MFA Types Setting */}
              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div className="settings-info" style={{ maxWidth: '80%' }}>
                    <span className="settings-label settings-label-mfa">Xác thực 2 lớp</span>
                    <span className="settings-desc">Bật xác thực bảo mật 2 lớp qua các phương thức sau để bảo vệ tài khoản tốt hơn.</span>
                  </div>
                  <div 
                    className={`custom-toggle-switch ${mfaEnabled ? 'active' : ''}`}
                    onClick={() => {
                      const nextState = !mfaEnabled;
                      setMfaEnabled(nextState);
                      if (nextState && mfaTypes.length === 0) {
                        setMfaTypes(['EMAIL']);
                      }
                    }}
                  >
                    <div className="toggle-switch-handle" />
                  </div>
                </div>

                {mfaEnabled && (
                  <div className="mfa-types-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', animation: 'fadeIn 0.2s ease' }}>
                    {[
                      { 
                        key: 'EMAIL', 
                        label: 'Email OTP',
                        logo: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        )
                      },
                      { 
                        key: 'TOTP', 
                        label: 'Google Authenticator (TOTP)',
                        logo: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        )
                      },
                      { 
                        key: 'PUSH', 
                        label: 'App Push Prompt',
                        logo: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                        )
                      },
                      { 
                        key: 'SMS', 
                        label: 'Tin nhắn SMS',
                        logo: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        )
                      }
                    ].map(item => {
                      const isChecked = mfaTypes.includes(item.key);
                      return (
                        <label 
                          key={item.key} 
                          className={`mfa-option-card ${isChecked ? 'active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMfaTypes([...mfaTypes, item.key]);
                              } else {
                                setMfaTypes(mfaTypes.filter(t => t !== item.key));
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          <div className="mfa-card-content">
                            <div className="mfa-logo-wrapper">
                              {item.logo}
                            </div>
                            <span className="mfa-card-label">{item.label}</span>
                          </div>
                          <div className={`mfa-custom-radio ${isChecked ? 'checked' : ''}`}>
                            <div className="mfa-custom-radio-inner" />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Actions Settings Footer */}
            <div className="profile-actions">
              {onLogout && (
                <button className="btn-logout-icon" onClick={onLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                  <span className="logout-text">Đăng xuất</span>
                </button>
              )}
              <button 
                className="btn-primary" 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                style={{ position: 'relative' }}
              >
                {isSavingSettings && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <div className="spinner-loader" style={{ margin: 0 }} />
                  </div>
                )}
                <div style={{ opacity: isSavingSettings ? 0 : 1 }}>
                  Lưu cài đặt
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="profile-section-fade">
            <div className="profile-fields-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#9333EA' }}>Đổi mật khẩu</h3>
                
                <div className="profile-field-group" style={{ width: '100%' }}>
                  <span className="profile-field-label">Mật khẩu hiện tại</span>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type={showOldPassword ? 'text' : 'password'}
                      className="profile-field-input" 
                      style={{ paddingRight: '40px' }}
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      {showOldPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="profile-field-group" style={{ width: '100%' }}>
                  <span className="profile-field-label">Mật khẩu mới</span>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      className="profile-field-input" 
                      style={{ paddingRight: '40px' }}
                      value={newPassword} 
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordMismatch) {
                          setPasswordMismatch(confirmPassword !== e.target.value);
                        }
                      }}
                      placeholder="Nhập mật khẩu mới..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      {showNewPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="profile-field-group" style={{ width: '100%' }}>
                  <span className="profile-field-label">Xác nhận mật khẩu mới</span>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`profile-field-input ${passwordMismatch ? 'input-error' : ''}`}
                      style={{ paddingRight: '40px' }}
                      value={confirmPassword} 
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordMismatch) {
                          setPasswordMismatch(e.target.value !== newPassword);
                        }
                      }}
                      onBlur={() => {
                        if (confirmPassword && confirmPassword !== newPassword) {
                          setPasswordMismatch(true);
                        } else {
                          setPasswordMismatch(false);
                        }
                      }}
                      placeholder="Xác nhận mật khẩu mới..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-password-submit"
                  onClick={handleChangePasswordSubmit}
                  disabled={isChangingPassword}
                  style={{ position: 'relative' }}
                >
                  {isChangingPassword && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <div className="spinner-loader" style={{ margin: 0 }} />
                    </div>
                  )}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: isChangingPassword ? 0 : 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Đổi mật khẩu
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Manager Modal with Sharp corners (No border-radius) */}
      {showAddressModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#F484A8' }}>Quản lý địa chỉ giao hàng</h2>
              <button 
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: 'var(--text-light)' }}
              >
                &times;
              </button>
            </div>

            {!showAddressForm ? (
              <>
                {/* Dashed pink Add Address button with bookmark plus icon */}
                <button 
                  type="button" 
                  className="btn-add-address-custom"
                  onClick={() => handleOpenAddressForm()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    <line x1="12" y1="7" x2="12" y2="13"></line>
                    <line x1="9" y1="10" x2="15" y2="10"></line>
                  </svg>
                  Thêm địa chỉ mới
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                  {addresses && addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        style={{ 
                          padding: '14px', 
                          border: '1px solid var(--border-dark)', 
                          backgroundColor: '#ffffff', 
                          borderRadius: 'var(--radius-sm)', /* Restored border-radius */
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: 'var(--text-main)' }}>
                            {addr.addressLabel || 'Địa chỉ'}
                          </div>
                          <p style={{ margin: '0 0 2px 0' }}>
                            <strong>SĐT:</strong> <span style={{ color: '#2563eb', fontWeight: '600' }}>{addr.recipientPhone}</span>
                          </p>
                          <p style={{ margin: '0' }}>
                            <strong>Chi tiết:</strong> <span style={{ color: '#16a34a', fontWeight: '500' }}>{addr.streetAddress}, {addr.wardName}, {addr.districtName}, {addr.provinceName}</span>
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleOpenAddressForm(addr)}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px', 
                              fontSize: '12.5px', 
                              border: 'none', 
                              background: 'transparent', 
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fdf2f5')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Sửa
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteAddress(addr.id)}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px', 
                              fontSize: '12.5px', 
                              border: 'none', 
                              background: 'transparent', 
                              color: '#dc2626',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>Chưa có địa chỉ nào.</p>
                  )}
                </div>
              </>
            ) : (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#9333EA' }}>
                  {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="profile-field-group">
                    <span className="profile-field-label">Nhãn địa chỉ</span>
                    <input 
                      type="text" 
                      className="profile-field-input" 
                      value={formLabel} 
                      onChange={(e) => setFormLabel(e.target.value)}
                      placeholder="Ví dụ: Nhà riêng, Văn phòng..."
                    />
                  </div>
                  <div className="profile-field-group">
                    <span className="profile-field-label">Số điện thoại</span>
                    <input 
                      type="text" 
                      className="profile-field-input phone-input-custom" 
                      value={formPhone} 
                      onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Số điện thoại nhận hàng..."
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  {/* Custom Province Dropdown */}
                  <div className="profile-field-group" ref={provinceDropdownRef} style={{ position: 'relative' }}>
                    <span className="profile-field-label">Tỉnh / Thành</span>
                    <div
                      className="custom-select-trigger"
                      onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                    >
                      <span className="selected-value-text">
                        {provinces.find(p => p.provinceId === selectedProvince)?.provinceName || 'Chọn Tỉnh/Thành'}
                      </span>
                      <svg 
                        className={`chevron-icon ${showProvinceDropdown ? 'open' : ''}`}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {showProvinceDropdown && (
                      <div className="custom-select-dropdown">
                        <div
                          className={`custom-select-option ${!selectedProvince ? 'selected' : ''}`}
                          onClick={() => {
                            handleProvinceChange(0);
                            setShowProvinceDropdown(false);
                          }}
                        >
                          Chọn Tỉnh/Thành
                        </div>
                        {provinces.map(p => (
                          <div
                            key={p.provinceId}
                            className={`custom-select-option ${selectedProvince === p.provinceId ? 'selected' : ''}`}
                            onClick={() => {
                              handleProvinceChange(p.provinceId);
                              setShowProvinceDropdown(false);
                            }}
                          >
                            {p.provinceName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom District Dropdown */}
                  <div className="profile-field-group" ref={districtDropdownRef} style={{ position: 'relative' }}>
                    <span className="profile-field-label">Quận / Huyện</span>
                    <div
                      className={`custom-select-trigger ${!selectedProvince ? 'disabled' : ''}`}
                      onClick={() => selectedProvince && setShowDistrictDropdown(!showDistrictDropdown)}
                      style={{ cursor: selectedProvince ? 'pointer' : 'not-allowed', opacity: selectedProvince ? 1 : 0.6 }}
                    >
                      <span className="selected-value-text">
                        {districts.find(d => d.districtId === selectedDistrict)?.districtName || 'Chọn Quận/Huyện'}
                      </span>
                      <svg 
                        className={`chevron-icon ${showDistrictDropdown ? 'open' : ''}`}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {showDistrictDropdown && selectedProvince && (
                      <div className="custom-select-dropdown">
                        <div
                          className={`custom-select-option ${!selectedDistrict ? 'selected' : ''}`}
                          onClick={() => {
                            handleDistrictChange(0);
                            setShowDistrictDropdown(false);
                          }}
                        >
                          Chọn Quận/Huyện
                        </div>
                        {districts.map(d => (
                          <div
                            key={d.districtId}
                            className={`custom-select-option ${selectedDistrict === d.districtId ? 'selected' : ''}`}
                            onClick={() => {
                              handleDistrictChange(d.districtId);
                              setShowDistrictDropdown(false);
                            }}
                          >
                            {d.districtName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Ward Dropdown */}
                  <div className="profile-field-group" ref={wardDropdownRef} style={{ position: 'relative' }}>
                    <span className="profile-field-label">Phường / Xã</span>
                    <div
                      className={`custom-select-trigger ${!selectedDistrict ? 'disabled' : ''}`}
                      onClick={() => selectedDistrict && setShowWardDropdown(!showWardDropdown)}
                      style={{ cursor: selectedDistrict ? 'pointer' : 'not-allowed', opacity: selectedDistrict ? 1 : 0.6 }}
                    >
                      <span className="selected-value-text">
                        {wards.find(w => w.wardCode === selectedWard)?.wardName || 'Chọn Phường/Xã'}
                      </span>
                      <svg 
                        className={`chevron-icon ${showWardDropdown ? 'open' : ''}`}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {showWardDropdown && selectedDistrict && (
                      <div className="custom-select-dropdown">
                        <div
                          className={`custom-select-option ${!selectedWard ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedWard(null);
                            setShowWardDropdown(false);
                          }}
                        >
                          Chọn Phường/Xã
                        </div>
                        {wards.map(w => (
                          <div
                            key={w.wardCode}
                            className={`custom-select-option ${selectedWard === w.wardCode ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedWard(w.wardCode);
                              setShowWardDropdown(false);
                            }}
                          >
                            {w.wardName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-field-group" style={{ marginBottom: '20px' }}>
                  <span className="profile-field-label">Địa chỉ chi tiết</span>
                  <input 
                    type="text" 
                    className="profile-field-input" 
                    value={formStreet} 
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                <div className="address-form-actions">
                  <button 
                    type="button" 
                    className="btn-address-cancel"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="button" 
                    className="btn-address-save" 
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress}
                    style={{ position: 'relative' }}
                  >
                    {isSavingAddress && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <div className="spinner-loader" style={{ margin: 0 }} />
                      </div>
                    )}
                    <div style={{ opacity: isSavingAddress ? 0 : 1 }}>
                      Lưu
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
