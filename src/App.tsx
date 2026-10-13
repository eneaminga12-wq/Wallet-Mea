import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AppShell from './layouts/AppShell';

const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const OtpVerification = lazy(() => import('./pages/auth/OtpVerification'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Send = lazy(() => import('./pages/Send'));
const Receive = lazy(() => import('./pages/Receive'));
const Buy = lazy(() => import('./pages/Buy'));
const Pay = lazy(() => import('./pages/Pay'));
const Vikoba = lazy(() => import('./pages/Vikoba'));
const VikobaDetail = lazy(() => import('./pages/VikobaDetail'));
const Ai = lazy(() => import('./pages/Ai'));
const Transactions = lazy(() => import('./pages/Transactions'));
const TransactionDetail = lazy(() => import('./pages/TransactionDetail'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const SmsUssd = lazy(() => import('./pages/SmsUssd'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f8]">
      <Loader2 className="h-7 w-7 animate-spin text-brand-700" />
    </div>
  );
}

function CheckAuthRoot() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<CheckAuthRoot />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify" element={<OtpVerification />} />
          <Route path="forgot" element={<ForgotPassword />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/vikoba" element={<Vikoba />} />
            <Route path="/vikoba/:id" element={<VikobaDetail />} />
            <Route path="/ai" element={<Ai />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/sms-ussd" element={<SmsUssd />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}
