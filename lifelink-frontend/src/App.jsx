import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import CallLogs from './pages/CallLogs';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import DashboardLayout from './components/layout/DashboardLayout';

function ProtectedRoute({ children, requireProfile = true }) {
  const { isAuthenticated, profileComplete } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireProfile && !profileComplete) return <Navigate to="/complete-profile" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute requireProfile={false}>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="search/:type" element={<SearchPage />} />
        <Route path="calls" element={<CallLogs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
