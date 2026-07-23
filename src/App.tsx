import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AIChatbox from './components/AIChatbox/AIChatbox';
import BookModal from './features/Book/BookModal/BookModal';
import DevSandbox from './components/DevSandbox/DevSandbox';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import BookDetail from './pages/BookDetail';
import Register from './pages/Register';
import BooksList from './pages/BooksList';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RegisterGoogle from './pages/RegisterGoogle';
import Cart from './pages/Cart';
import CheckoutResult from './pages/CheckoutResult';
import OrderDetail from './pages/OrderDetail';
import Vouchers from './pages/Vouchers';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider } from './context/AuthContext';
import { LoginProvider } from './context/LoginContext';
import { ROUTES } from './config/routes';

function AppContent() {
  const { currentPage, selectedBook, setSelectedBook } = useNavigation();

  return (
    <>
      {currentPage !== 'login' && (
        <Header />
      )}

      {/* Main Content Router */}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.BOOK_DETAIL} element={<BookDetail />} />
          <Route path={ROUTES.BOOKS} element={<BooksList />} />
           <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetail />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={ROUTES.REGISTER_GOOGLE} element={<RegisterGoogle />} />
          <Route path={ROUTES.CART} element={<Cart />} />
          <Route path={ROUTES.CHECKOUT_RESULT} element={<CheckoutResult />} />
          <Route path={ROUTES.VOUCHERS} element={<Vouchers />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>

      <DevSandbox />

      <Footer />

      <AIChatbox />

      {/* Book details Modal Popup */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Toast Notification */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored" 
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <AuthProvider>
          <LoginProvider>
            <AppContent />
          </LoginProvider>
        </AuthProvider>
      </NavigationProvider>
    </BrowserRouter>
  );
}

export default App;
