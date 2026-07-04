import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../features/Customer/Profile';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import { ROUTES } from '../config/routes';

function Profile() {
  useSeo(
    'Hồ sơ cá nhân | InkPulse Bookstore',
    'Quản lý thông tin tài khoản, cài đặt giao diện và cấu hình bảo mật xác thực hai lớp MFA của bạn tại InkPulse Bookstore.'
  );

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return <ProfileForm />;
}

export default Profile;
