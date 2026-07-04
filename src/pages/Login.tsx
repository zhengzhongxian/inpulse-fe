import LoginForm from '../features/Auth/LoginForm';
import { useSeo } from '../hooks/useSeo';

function Login() {
  useSeo(
    'Đăng nhập tài khoản | InkPulse Bookstore',
    'Đăng nhập tài khoản InkPulse Bookstore để mua sách, theo dõi đơn hàng và tùy biến bảo mật xác thực hai lớp MFA.'
  );
  return <LoginForm />;
}

export default Login;
