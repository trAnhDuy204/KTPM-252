import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Building2, AlertCircle } from 'lucide-react';

const validate = (v) => ({
  email: !v.email ? 'Email là bắt buộc'
    : !/\S+@\S+\.\S+/.test(v.email) ? 'Email không hợp lệ' : '',
  password: !v.password ? 'Mật khẩu là bắt buộc' : '',
});

const getRolePath = (role) =>
  ({ ADMIN: '/admin', RECEPTION: '/reception' }[role] ?? '/dashboard');

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [serverError, setServerError] = useState('');
  const { values, errors, touched, handleChange, handleBlur, isValid } =
    useForm({ email: '', password: '' }, validate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!isValid()) return;
    try {
      const data = await login(values);
      navigate(getRolePath(data.user.role));
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-zinc-900 items-center justify-center">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 35%, rgba(201,169,110,0.07) 0%, transparent 55%),
            radial-gradient(circle at 75% 70%, rgba(201,169,110,0.04) 0%, transparent 50%)`,
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #c9a96e 0, #c9a96e 1px, transparent 0, transparent 50%)`,
          backgroundSize: '28px 28px',
        }} />
        <div className="relative z-10 text-center">
          <div className="mb-4" style={{ filter: 'drop-shadow(0 0 40px rgba(201,169,110,0.35))' }}>
            <Building2 className="w-16 h-16 text-gold-500 mx-auto" />
          </div>
          <h1 className="font-display text-6xl font-semibold tracking-[0.2em] text-gold-500 mb-2">LUMIÈRE</h1>
          <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase">Hotel Management System</p>
          <div className="mt-10 flex items-center gap-4 justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-700/50" />
            <div className="w-1 h-1 rounded-full bg-yellow-600/50" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-700/50" />
          </div>
          <p className="mt-8 text-zinc-500 text-sm font-light max-w-xs mx-auto leading-relaxed">
            Hệ thống quản lý khách sạn toàn diện, dành cho mọi quy mô
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 bg-zinc-950 lg:border-l border-zinc-800/60">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <Building2 className="w-10 h-10 text-yellow-500 mx-auto" />
            <h1 className="font-display text-3xl font-semibold tracking-widest text-yellow-500 mt-2">LUMIÈRE</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-4xl font-semibold text-zinc-100 mb-2">Đăng nhập</h2>
            <p className="text-zinc-500 text-sm font-light">Chào mừng trở lại. Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">Email</label>
              <input name="email" type="email" placeholder="your@email.com"
                value={values.email} onChange={handleChange} onBlur={handleBlur} autoComplete="email"
                className={`w-full bg-zinc-800/80 border rounded-lg px-4 py-3 text-zinc-100 text-sm font-light outline-none transition-all duration-200 placeholder:text-zinc-600 ${touched.email && errors.email ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10'}`} />
              {touched.email && errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">Mật khẩu</label>
              <input name="password" type="password" placeholder="••••••••"
                value={values.password} onChange={handleChange} onBlur={handleBlur} autoComplete="current-password"
                className={`w-full bg-zinc-800/80 border rounded-lg px-4 py-3 text-zinc-100 text-sm font-light outline-none transition-all duration-200 placeholder:text-zinc-600 ${touched.password && errors.password ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10'}`} />
              {touched.password && errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}