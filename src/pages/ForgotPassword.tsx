import ForgotPasswordForm from '../features/Auth/ForgotPassword';
import { useSeo } from '../hooks/useSeo';

function ForgotPassword() {
  useSeo(
    'Quên mật khẩu | InkPulse Bookstore',
    'Yêu cầu đặt lại mật khẩu bảo mật tài khoản InkPulse Bookstore thông qua địa chỉ email đăng ký.'
  );
  return <ForgotPasswordForm />;
}

export default ForgotPassword;
