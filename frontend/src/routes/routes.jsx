import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReceptionLayout from '@/components/layout/ReceptionLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import CustomerLayout from '@/components/layout/CustomerLayout';
import LoginPage from '@/pages/LoginPage';
import BookingPage from '@/pages/customer/BookingPage';
import RegisterPage from '@/pages/RegisterPage';
import ReviewPage from '@/pages/customer/ReviewPage';
import HotelManagement from '@/pages/admin/HotelManagement';
import AdminRoomManagement from '@/pages/admin/AdminRoomManagement';
import PaymentResult from '@/pages/customer/PaymentResult';
import UserManagement from '@/pages/admin/UserManagement';
import RoomTypeManagement from '@/pages/admin/RoomTypeManagement';
import { CustomerDashboard, ReceptionDashboard, AdminDashboard } from '@/pages/DashboardPage';
import RoomManagement from '@/pages/reception/RoomManagement';
import CheckInOut from '@/pages/reception/CheckInOut';
import HomePage from '@/pages/HomePage';
import HotelRoomsDisplay from '@/pages/customer/HotelRoomApp';
import ProfilePage from '@/pages/customer/ProfilePage';

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
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/payment-result" element={<PaymentResult />} />

      <Route path="/dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
      <Route path="/dashboard/profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />
      <Route path="/dashboard/reviews" element={<CustomerRoute><ReviewPage /></CustomerRoute>} />
      <Route path="/dashboard/hotels" element={<CustomerRoute><HotelRoomsDisplay /> </CustomerRoute>} />
      <Route path="/dashboard/booking" element={<CustomerRoute><BookingPage /></CustomerRoute>} />

      <Route path="/reception" element={<ReceptionRoute><ReceptionDashboard /></ReceptionRoute>} />
      <Route path="/reception/rooms" element={<ReceptionRoute><RoomManagement /></ReceptionRoute>} />
      <Route path="/reception/check-in-out" element={<ReceptionRoute><CheckInOut /></ReceptionRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/rooms" element={<AdminRoute><AdminRoomManagement /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/room-types" element={<AdminRoute><RoomTypeManagement /></AdminRoute>} />
      <Route path="/admin/hotels" element={<AdminRoute><HotelManagement /></AdminRoute>} />
      
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
