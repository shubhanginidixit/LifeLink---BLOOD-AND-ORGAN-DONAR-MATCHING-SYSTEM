import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DonorRegistrationPage from './pages/DonorRegistrationPage';
import EmergencyRequestPage from './pages/EmergencyRequestPage';
import ChartsPage from './pages/ChartsPage';
import MapPage from './pages/MapPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Registration Flow */}
          <Route element={<AuthLayout />}>
            <Route 
              path="/register-donor" 
              element={
                <ProtectedRoute requiredRole="donor">
                  <DonorRegistrationPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/map" element={<MapPage />} />
            
            {/* Hospital Only */}
            <Route 
              path="/emergency" 
              element={
                <ProtectedRoute requiredRole="hospital">
                  <EmergencyRequestPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirects */}
            <Route path="/donors" element={<Navigate to="/dashboard" replace />} />
            <Route path="/requests" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
