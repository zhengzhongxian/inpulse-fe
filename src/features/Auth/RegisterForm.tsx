import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerSendOtpApi, registerVerifyApi } from '../../api/auth';
import { getProvincesApi, getDistrictsApi, getWardsApi } from '../../api/address';
import type { GhnProvinceResponse, GhnDistrictResponse, GhnWardResponse } from '../../api/address';
import { useLogin } from '../../context/LoginContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ROUTES } from '../../config/routes';
import './RegisterForm.css';

export default function RegisterForm() {
  const { deviceId, browserFingerprint } = useLogin();
  const { completeLoginFlow: onRegisterSuccess } = useAuth();
  const { handlePageNavigation } = useNavigation();

  const [stage, setStage] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [gender, setGender] = useState<string>('UNKNOWN');
  const [dob, setDob] = useState<string>('');

  // Address Fields
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [provinces, setProvinces] = useState<GhnProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<GhnDistrictResponse[]>([]);
  const [wards, setWards] = useState<GhnWardResponse[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<number | ''>('');
  const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [addressLabel, setAddressLabel] = useState<string>('Nhà riêng');

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

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        const res = await getDistrictsApi(Number(selectedProvince));
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

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard('');
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await getWardsApi(Number(selectedDistrict));
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

  // Custom Gender Dropdown with Icons setup
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowGenderDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const genderOptions = [
    { value: 'MALE', label: 'Nam', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <circle cx="10" cy="14" r="5"></circle>
        <line x1="19" y1="5" x2="13.6" y2="10.4"></line>
        <polyline points="19 11 19 5 13 5"></polyline>
      </svg>
    )},
    { value: 'FEMALE', label: 'Nữ', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <circle cx="12" cy="8" r="5"></circle>
        <line x1="12" y1="13" x2="12" y2="21"></line>
        <line x1="9" y1="17" x2="15" y2="17"></line>
      </svg>
    )},
    { value: 'OTHER', label: 'Khác', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 12h8"></path>
        <path d="M12 8v8"></path>
      </svg>
    )},
    { value: 'UNKNOWN', label: 'Không xác định', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )}
  ];

  // Custom Date Picker setup
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [viewMonth, setViewMonth] = useState<number>(() => dob ? new Date(dob).getMonth() : new Date().getMonth());
  const [viewYear, setViewYear] = useState<number>(() => dob ? new Date(dob).getFullYear() : new Date().getFullYear());

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

  // OTP Fields
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [cooldown, setCooldown] = useState<number>(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword || !firstName || !lastName || !recipientPhone || !selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không trùng khớp.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Mật khẩu phải từ 8 ký tự trở lên, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerSendOtpApi(email, deviceId, browserFingerprint);
      setLoading(false);
      if (res.data.success) {
        toast.success('Mã OTP xác thực đã được gửi tới email của bạn.');
        setStage('otp');
        setCooldown(60);
      } else {
        toast.error(res.data.message || 'Không thể gửi mã xác thực.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Lỗi hệ thống khi gửi OTP.';
      toast.error(msg);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await registerSendOtpApi(email, deviceId, browserFingerprint);
      setLoading(false);
      if (res.data.success) {
        toast.success('Đã gửi lại mã OTP thành công!');
        setCooldown(60);
      } else {
        toast.error(res.data.message || 'Không thể gửi lại mã OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Không thể kết nối đến máy chủ.';
      toast.error(msg);
    }
  };

  const handleOtpBoxChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/\D/g, '');
    const nextValue = [...otpCode];
    nextValue[index] = value.slice(-1);
    setOtpCode(nextValue);

    if (value && index < 5) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.otp-inputs .otp-box');
      inputs[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const nextValue = [...otpCode];
      if (otpCode[index]) {
        nextValue[index] = '';
        setOtpCode(nextValue);
      } else if (index > 0) {
        nextValue[index - 1] = '';
        setOtpCode(nextValue);
        const inputs = document.querySelectorAll<HTMLInputElement>('.otp-inputs .otp-box');
        inputs[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const inputs = document.querySelectorAll<HTMLInputElement>('.otp-inputs .otp-box');
      inputs[index - 1]?.focus();
      return;
    }

    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const inputs = document.querySelectorAll<HTMLInputElement>('.otp-inputs .otp-box');
      inputs[index + 1]?.focus();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey || e.nativeEvent.isComposing) return;

    const digitCodes = ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9',
      'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9'];
    if (!digitCodes.includes(e.code)) {
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const nextValue: string[] = Array(6).fill('');
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      nextValue[i] = pastedData[i];
    }
    setOtpCode(nextValue);

    const focusIndex = Math.min(pastedData.length, 5);
    const inputs = document.querySelectorAll<HTMLInputElement>('.otp-inputs .otp-box');
    inputs[focusIndex]?.focus();
  };

  const handleVerifyRegister = async () => {
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP 6 số.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerVerifyApi({
        email,
        otpCode: fullOtp,
        userName: username,
        password,
        firstName,
        lastName,
        gender,
        dob: dob || null,
        deviceId,
        deviceName: 'Chrome / Windows',
        deviceType: 'DESKTOP',
        browserFingerprint,
        choiceLanguage: 'VI',
        recipientPhone,
        provinceId: Number(selectedProvince),
        districtId: Number(selectedDistrict),
        wardCode: selectedWard,
        streetAddress,
        addressLabel: addressLabel || 'Nhà riêng'
      });
      setLoading(false);

      if (res.data.success) {
        toast.success('Đăng ký tài khoản thành công!');
        onRegisterSuccess(res.data.data, username, email);
        handlePageNavigation('home');
      } else {
        toast.error(res.data.message || 'Đăng ký thất bại.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Mã xác thực không chính xác hoặc đã hết hạn.';
      toast.error(msg);
    }
  };

  return (
    <section className="register-wrapper">
      <div className="register-card">
        {stage === 'otp' ? (
          <div className="register-back-btn" onClick={() => setStage('form')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Quay lại điền thông tin</span>
          </div>
        ) : (
          <Link to={ROUTES.HOME} className="register-back-btn" style={{ textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Quay lại trang chủ</span>
          </Link>
        )}

        {stage === 'form' ? (
          <div>
            <h2 className="register-title">Tạo Tài Khoản Mới</h2>
            <p className="register-subtitle">Đăng ký thành viên để khám phá kho tài liệu cao cấp</p>

            <form onSubmit={handleSendOtp}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Họ *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nguyễn"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Văn A"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email liên kết *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tên đăng nhập *</label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nguyenvana123"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mật khẩu *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu mạnh (tối thiểu 8 ký tự)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nhập lại mật khẩu *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Trùng khớp mật khẩu trên"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
                  <label className="form-label">Giới tính</label>
                  <div 
                    className="form-input custom-select-trigger" 
                    onClick={() => setShowGenderDropdown(!showGenderDropdown)}
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
                      {genderOptions.find(o => o.value === gender)?.icon}
                      <span style={{ color: 'var(--text-main)' }}>{genderOptions.find(o => o.value === gender)?.label}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '14px', top: '50%', transition: 'transform 0.2s ease', transformOrigin: 'center', transform: showGenderDropdown ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {showGenderDropdown && (
                    <div 
                      className="custom-select-dropdown" 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-dark)',
                        marginTop: '4px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        animation: 'fadeIn 0.2s ease'
                      }}
                    >
                      {genderOptions.map(option => (
                        <div 
                          key={option.value}
                          className="custom-select-option"
                          onClick={() => {
                            setGender(option.value);
                            setShowGenderDropdown(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            backgroundColor: gender === option.value ? '#fdf2f8' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (gender !== option.value) {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (gender !== option.value) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {option.icon}
                          <span style={{ fontSize: '14.5px', color: 'var(--text-main)', fontWeight: gender === option.value ? '600' : '400' }}>
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" ref={datePickerRef} style={{ position: 'relative' }}>
                  <label className="form-label">Ngày sinh</label>
                  <div 
                    className="form-input custom-date-trigger" 
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
                      <span style={{ color: dob ? 'var(--text-main)' : 'var(--text-light)' }}>
                        {formatDateDisplay(dob)}
                      </span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '14px', top: '50%', transition: 'transform 0.2s ease', transformOrigin: 'center', transform: showDatePicker ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}>
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
                      {/* Nav Header */}
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

                      {/* Weekdays */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font)' }}>
                        {weekdays.map(d => <div key={d}>{d}</div>)}
                      </div>

                      {/* Days Grid */}
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

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '8px', color: 'var(--primary)' }}>
                Địa chỉ nhận hàng mặc định
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">SĐT nhận hàng *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="09XXXXXXXX"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nhãn địa chỉ</label>
                  <select
                    className="form-select"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                  >
                    <option value="Nhà riêng">Nhà riêng</option>
                    <option value="Văn phòng">Văn phòng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tỉnh / Thành phố *</label>
                <select
                  className="form-select"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Chọn Tỉnh / Thành phố...</option>
                  {provinces.map((prov) => (
                    <option key={prov.provinceId} value={prov.provinceId}>
                      {prov.provinceName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quận / Huyện *</label>
                  <select
                    className="form-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : '')}
                    disabled={!selectedProvince}
                    required
                  >
                    <option value="">Chọn Quận / Huyện...</option>
                    {districts.map((dist) => (
                      <option key={dist.districtId} value={dist.districtId}>
                        {dist.districtName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phường / Xã *</label>
                  <select
                    className="form-select"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                    required
                  >
                    <option value="">Chọn Phường / Xã...</option>
                    {wards.map((w) => (
                      <option key={w.wardCode} value={w.wardCode}>
                        {w.wardName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  className="form-input"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, ngõ..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={loading}
                style={{ marginTop: '16px' }}
              >
                {loading ? <span className="btn-spinner"></span> : 'Tiếp tục & Gửi OTP'}
              </button>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                Đã có tài khoản?{' '}
                <Link
                  to={ROUTES.LOGIN}
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="mfa-stage">
            <h2 className="register-title">Xác Thực Email</h2>
            <p className="register-subtitle">
              Mã xác thực đăng ký đã được gửi đến email <strong>{email}</strong>. Vui lòng nhập mã để kích hoạt tài khoản.
            </p>

            <div className="otp-inputs">
              {otpCode.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={1}
                  className="otp-box"
                  value={data}
                  onChange={(e) => handleOtpBoxChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>

            <button
              className="btn-primary btn-submit"
              onClick={handleVerifyRegister}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner"></span> : 'Hoàn Tất Đăng Ký'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                className="btn-link"
                disabled={cooldown > 0 || loading}
                onClick={handleResendOtp}
                style={{
                  color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                  fontWeight: 600,
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background: 'none',
                  textDecoration: cooldown > 0 ? 'none' : 'underline',
                }}
              >
                {cooldown > 0 ? `Gửi lại mã sau (${cooldown}s)` : 'Gửi lại mã OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
