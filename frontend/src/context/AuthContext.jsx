import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../service/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveSession = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = useCallback(async (formData) => {
    setLoading(true); setError(null);
    try {
      const { data } = await authApi.register(formData);
      saveSession(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const fieldErrors = err.response?.data?.errors || null;
      setError(msg);
      throw { message: msg, fieldErrors };
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (formData) => {
    setLoading(true); setError(null);
    try {
      const { data } = await authApi.login(formData);
      saveSession(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw { message: msg };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setError(null);
  }, []);

  const createStaff = useCallback(async (formData) => {
    setLoading(true); setError(null);
    try {
      const { data } = await authApi.createStaff(formData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create staff';
      const fieldErrors = err.response?.data?.errors || null;
      setError(msg);
      throw { message: msg, fieldErrors };
    } finally { setLoading(false); }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, createStaff, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};