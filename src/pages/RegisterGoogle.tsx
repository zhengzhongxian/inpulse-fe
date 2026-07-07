import RegisterGoogleForm from '../features/Auth/RegisterGoogle';
import { useSeo } from '../hooks/useSeo';

function RegisterGoogle() {
  useSeo(
    'Hoàn tất đăng ký Google | InkPulse Bookstore',
    'Hoàn tất cập nhật các trường thông tin tài khoản đăng ký liên kết qua Google.'
  );
  return <RegisterGoogleForm />;
}

export default RegisterGoogle;
