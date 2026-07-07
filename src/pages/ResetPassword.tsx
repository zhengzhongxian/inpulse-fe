import ResetPasswordForm from '../features/Auth/ResetPassword';
import { useSeo } from '../hooks/useSeo';

function ResetPassword() {
  useSeo(
    'Đặt lại mật khẩu | InkPulse Bookstore',
    'Thiết lập mật khẩu bảo mật mới cho tài khoản InkPulse Bookstore.'
  );
  return <ResetPasswordForm />;
}

export default ResetPassword;
