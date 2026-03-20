import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReceptionLayout from '@/components/layout/ReceptionLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import { CustomerDashboard, ReceptionDashboard, AdminDashboard } from '@/pages/DashboardPage';
import RoomManagement from '@/pages/reception/RoomManagement';
import CheckInOut from '@/pages/reception/CheckInOut';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'RECEPTION') return <Navigate to="/reception" replace />;
  return <Navigate to="/dashboard" replace />;
}

function ReceptionRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['RECEPTION']}>
      <ReceptionLayout>{children}</ReceptionLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      {/* Reception routes — all wrapped in sidebar layout */}
      <Route path="/reception" element={<ReceptionRoute><ReceptionDashboard /></ReceptionRoute>} />
      <Route path="/reception/rooms" element={<ReceptionRoute><RoomManagement /></ReceptionRoute>} />
      <Route path="/reception/check-in-out" element={<ReceptionRoute><CheckInOut /></ReceptionRoute>} />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
