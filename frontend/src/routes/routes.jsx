import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReceptionLayout from '@/components/layout/ReceptionLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import CustomerLayout from '@/components/layout/CustomerLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ReviewPage from '@/pages/customer/ReviewPage';
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

function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function CustomerRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <CustomerLayout>{children}</CustomerLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
      <Route path="/dashboard/reviews" element={<CustomerRoute><ReviewPage /></CustomerRoute>} />

      {/* Reception routes — all wrapped in sidebar layout */}
      <Route path="/reception" element={<ReceptionRoute><ReceptionDashboard /></ReceptionRoute>} />
      <Route path="/reception/rooms" element={<ReceptionRoute><RoomManagement /></ReceptionRoute>} />
      <Route path="/reception/check-in-out" element={<ReceptionRoute><CheckInOut /></ReceptionRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

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
