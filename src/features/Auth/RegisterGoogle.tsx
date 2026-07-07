import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import { googleRegisterApi } from '../../api/auth';
import { getProvincesApi, getDistrictsApi, getWardsApi } from '../../api/address';
import type { GhnProvinceResponse, GhnDistrictResponse, GhnWardResponse } from '../../api/address';
import { toast } from 'react-toastify';

function RegisterGoogle() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { completeLoginFlow } = useAuth();

  const googleData = state as { googleUserId: string; email: string; name: string; picture: string } | null;

  // Redirect to login if google data not present
  useEffect(() => {
    if (!googleData) {
      toast.error('Không tìm thấy thông tin đăng nhập Google. Vui lòng đăng nhập lại.');
      navigate(ROUTES.LOGIN);
    }
  }, [googleData, navigate]);

  const [username] = useState(() => {
    if (googleData?.email) {
      return googleData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    return '';
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('OTHER');
  const [dob, setDob] = useState('');
  const choiceLanguage = 'VI';

  // Refs for custom selectors
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  const [viewMonth, setViewMonth] = useState(() => dob ? new Date(dob).getMonth() : new Date().getMonth());
  const [viewYear, setViewYear] = useState(() => dob ? new Date(dob).getFullYear() : new Date().getFullYear());

  // Listen for outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowGenderDropdown(false);
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

  // Address fields
  const [recipientPhone, setRecipientPhone] = useState('');
  const [provinces, setProvinces] = useState<GhnProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<GhnDistrictResponse[]>([]);
  const [wards, setWards] = useState<GhnWardResponse[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | ''>('');
  const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('Nhà riêng');

  const [loading, setLoading] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await getProvincesApi();
        if (res.data.success) {
          setProvinces(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch provinces', err);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts on province change
  useEffect(() => {
    console.log('RegisterGoogle: selectedProvince changed:', selectedProvince);
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        console.log('RegisterGoogle: Fetching districts for province:', selectedProvince);
        const res = await getDistrictsApi(Number(selectedProvince));
        console.log('RegisterGoogle: getDistrictsApi response:', res.data);
        if (res.data.success) {
          setDistricts(res.data.data);
          setSelectedDistrict('');
        }
      } catch (err) {
        console.error('Failed to fetch districts', err);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards on district change
  useEffect(() => {
    console.log('RegisterGoogle: selectedDistrict changed:', selectedDistrict);
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard('');
      return;
    }
    const fetchWards = async () => {
      try {
        console.log('RegisterGoogle: Fetching wards for district:', selectedDistrict);
        const res = await getWardsApi(Number(selectedDistrict));
        console.log('RegisterGoogle: getWardsApi response:', res.data);
        if (res.data.success) {
          setWards(res.data.data);
          setSelectedWard('');
        }
      } catch (err) {
        console.error('Failed to fetch wards', err);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  if (!googleData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !gender || !dob || !recipientPhone || !selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
      toast.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      let deviceId = localStorage.getItem('inkpulse_device_id') || '';
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('inkpulse_device_id', deviceId);
      }

      const payload = {
        googleUserId: googleData.googleUserId,
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture,
        username,
        firstName,
        lastName,
        gender,
        dob,
        choiceLanguage,
        deviceId,
        deviceName: 'Browser Client',
        deviceType: 'DESKTOP',
        browserFingerprint: 'browser_fp_mock',
        recipientPhone,
        provinceId: Number(selectedProvince),
        districtId: Number(selectedDistrict),
        wardCode: selectedWard,
        streetAddress,
        addressLabel,
      };

      const response = await googleRegisterApi(payload);

      completeLoginFlow(response.data.data, username, googleData.email);
      toast.success('Đăng ký và đăng nhập thành công!');
      navigate(ROUTES.HOME);
      window.location.reload();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất đăng ký.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-wrapper" style={{ padding: '60px 15px' }}>
      <div className="login-card" style={{ maxWidth: '650px', width: '100%' }}>
        <h2 className="login-title" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#F66398', fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '10px' }}>
          Hoàn tất thông tin đăng ký
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
          Chào mừng <strong>{googleData.name}</strong>! Vui lòng điền thêm một số thông tin để hoàn tất tài khoản của bạn.
        </p>

        {/* User Card info from Google */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          background: '#f3f4f6',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {googleData.picture ? (
            <img src={googleData.picture} alt={googleData.name} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #F66398' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F66398', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px' }}>
              {googleData.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{googleData.name}</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#d97706', fontWeight: 600 }}>{googleData.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account Profile Fields */}
          <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
            Thông tin tài khoản
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="profile-field-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Họ (Tùy chọn)</label>
              <input
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ví dụ: Nguyễn"
                style={{ height: '42px', padding: '10px 14px', boxSizing: 'border-box' }}
              />
            </div>
            <div className="profile-field-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Tên (Tùy chọn)</label>
              <input
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ví dụ: An"
                style={{ height: '42px', padding: '10px 14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', zIndex: 11, position: 'relative' }}>
            {/* Custom Gender Select Box */}
            <div className="profile-field-group" ref={dropdownRef} style={{ position: 'relative' }}>
              <label className="form-label">Giới tính <span style={{ color: '#ef4444' }}>*</span></label>
              <div
                className="custom-select-trigger"
                onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                style={{ height: '42px' }}
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
                        setGender(option.value);
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

            {/* Custom Datepicker */}
            <div className="profile-field-group" ref={datePickerRef} style={{ position: 'relative' }}>
              <label className="form-label">Ngày sinh <span style={{ color: '#ef4444' }}>*</span></label>
              <div
                className="custom-select-trigger"
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  backgroundColor: '#FFFFFF',
                  paddingRight: '40px',
                  position: 'relative',
                  height: '42px'
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
          </div>

          {/* Delivery Address Fields */}
          <h4 style={{ margin: '24px 0 16px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
            Địa chỉ nhận hàng ban đầu
          </h4>

          <div className="profile-field-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Số điện thoại nhận hàng <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="tel"
              className="form-input"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="Nhập số điện thoại nhận hàng..."
              required
              style={{ height: '42px', padding: '10px 14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', zIndex: 10, position: 'relative' }}>
            {/* Custom Province Dropdown */}
            <div className="profile-field-group" ref={provinceDropdownRef} style={{ position: 'relative' }}>
              <label className="form-label">Tỉnh / Thành phố <span style={{ color: '#ef4444' }}>*</span></label>
              <div
                className="custom-select-trigger"
                onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                style={{ height: '42px' }}
              >
                <span className="selected-value-text" style={{ color: selectedProvince ? 'var(--text-main)' : 'var(--text-light)' }}>
                  {provinces.find(p => p.provinceId === selectedProvince)?.provinceName || 'Chọn Tỉnh/Thành...'}
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
                      setSelectedProvince('');
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
                        setSelectedProvince(p.provinceId);
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
              <label className="form-label">Quận / Huyện <span style={{ color: '#ef4444' }}>*</span></label>
              <div
                className={`custom-select-trigger ${!selectedProvince ? 'disabled' : ''}`}
                onClick={() => selectedProvince && setShowDistrictDropdown(!showDistrictDropdown)}
                style={{
                  cursor: selectedProvince ? 'pointer' : 'not-allowed',
                  opacity: selectedProvince ? 1 : 0.6,
                  height: '42px'
                }}
              >
                <span className="selected-value-text" style={{ color: selectedDistrict ? 'var(--text-main)' : 'var(--text-light)' }}>
                  {districts.find(d => d.districtId === selectedDistrict)?.districtName || 'Chọn Quận/Huyện...'}
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
                      setSelectedDistrict('');
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
                        setSelectedDistrict(d.districtId);
                        setShowDistrictDropdown(false);
                      }}
                    >
                      {d.districtName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', zIndex: 9, position: 'relative' }}>
            {/* Custom Ward Dropdown */}
            <div className="profile-field-group" ref={wardDropdownRef} style={{ position: 'relative' }}>
              <label className="form-label">Phường / Xã <span style={{ color: '#ef4444' }}>*</span></label>
              <div
                className={`custom-select-trigger ${!selectedDistrict ? 'disabled' : ''}`}
                onClick={() => selectedDistrict && setShowWardDropdown(!showWardDropdown)}
                style={{
                  cursor: selectedDistrict ? 'pointer' : 'not-allowed',
                  opacity: selectedDistrict ? 1 : 0.6,
                  height: '42px'
                }}
              >
                <span className="selected-value-text" style={{ color: selectedWard ? 'var(--text-main)' : 'var(--text-light)' }}>
                  {wards.find(w => w.wardCode === selectedWard)?.wardName || 'Chọn Phường/Xã...'}
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
                      setSelectedWard('');
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

            <div className="profile-field-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Nhãn địa chỉ</label>
              <input
                type="text"
                className="form-input"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                placeholder="Ví dụ: Nhà riêng, Văn phòng..."
                style={{ height: '42px', padding: '10px 14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div className="profile-field-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Địa chỉ chi tiết <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Số nhà, tên đường, tên ngõ..."
              required
              style={{ height: '42px', padding: '10px 14px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-submit"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? <span className="btn-spinner"></span> : 'Hoàn tất & Đăng nhập'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default RegisterGoogle;
