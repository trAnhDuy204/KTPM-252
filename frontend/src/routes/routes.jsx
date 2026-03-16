import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { CustomerDashboard, ReceptionDashboard, AdminDashboard } from '../pages/DashboardPage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'RECEPTION') return <Navigate to="/reception" replace />;
  return <Navigate to="/dashboard" replace />;
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

      <Route path="/reception" element={
        <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
          <ReceptionDashboard />
        </ProtectedRoute>
      } />

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
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}