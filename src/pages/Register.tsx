import RegisterForm from '../features/Auth/RegisterForm';
import { useSeo } from '../hooks/useSeo';

function Register() {
  useSeo(
    'Đăng ký tài khoản | InkPulse Bookstore',
    'Đăng ký tài khoản InkPulse Bookstore để bắt đầu mua sắm sách, nạp xu và tham gia các tính năng độc quyền cho thành viên.'
  );
  return <RegisterForm />;
}

export default Register;
