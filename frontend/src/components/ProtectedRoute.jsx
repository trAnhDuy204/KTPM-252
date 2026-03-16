import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard for this role
    const rolePath = { ADMIN: '/admin', RECEPTION: '/reception', CUSTOMER: '/dashboard' };
    return <Navigate to={rolePath[user.role] || '/dashboard'} replace />;
  }

  return children;
}