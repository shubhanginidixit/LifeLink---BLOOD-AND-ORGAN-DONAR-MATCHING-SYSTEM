import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';
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
import Chat from './pages/Chat';
import DashboardLayout from './components/layout/DashboardLayout';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, logout } = useAuth();
  const didLogout = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !didLogout.current) {
      didLogout.current = true;
      logout();
    }
  }, [loading, isAuthenticated]);

  if (loading) return null;
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
          <ProtectedRoute>
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
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:userId" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <LocationProvider>
            <AppRoutes />
          </LocationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
