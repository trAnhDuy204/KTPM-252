import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';

const validate = (v) => ({
  fullName: !v.fullName?.trim() ? 'Họ tên là bắt buộc'
    : v.fullName.trim().length < 2 ? 'Tối thiểu 2 ký tự' : '',
  email: !v.email ? 'Email là bắt buộc'
    : !/\S+@\S+\.\S+/.test(v.email) ? 'Email không hợp lệ' : '',
  password: !v.password ? 'Mật khẩu là bắt buộc'
    : v.password.length < 8 ? 'Tối thiểu 8 ký tự'
    : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v.password) ? 'Cần chữ hoa, chữ thường và số' : '',
  confirmPassword: !v.confirmPassword ? 'Vui lòng xác nhận mật khẩu'
    : v.confirmPassword !== v.password ? 'Mật khẩu không khớp' : '',
  phone: v.phone && !/^(\+?[0-9]{9,15})?$/.test(v.phone) ? 'Số điện thoại không hợp lệ' : '',
});

const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
};

const strengthConfig = [
  null,
  { label: 'Yếu', color: 'bg-red-500' },
  { label: 'Trung bình', color: 'bg-amber-500' },
  { label: 'Khá', color: 'bg-yellow-500' },
  { label: 'Mạnh', color: 'bg-emerald-500' },
];

const inputCls = (hasError) =>
  `w-full bg-zinc-800/80 border rounded-lg px-4 py-3 text-zinc-100 text-sm font-light outline-none transition-all duration-200 placeholder:text-zinc-600 ${
    hasError
      ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
      : 'border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10'
  }`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [serverError, setServerError] = useState('');
  const { values, errors, touched, handleChange, handleBlur, isValid, setFieldErrors } =
    useForm({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' }, validate);

  const strength = getStrength(values.password);
  const sc = strengthConfig[strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!isValid()) return;
    const { confirmPassword, ...payload } = values;
    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-zinc-900 items-center justify-center">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, rgba(201,169,110,0.07) 0%, transparent 55%),
            radial-gradient(circle at 70% 75%, rgba(201,169,110,0.04) 0%, transparent 50%)`,
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(-45deg, #c9a96e 0, #c9a96e 1px, transparent 0, transparent 50%)`,
          backgroundSize: '28px 28px',
        }} />
        <div className="relative z-10 text-center px-12">
          <div className="text-yellow-500 text-7xl mb-4 leading-none"
            style={{ filter: 'drop-shadow(0 0 40px rgba(201,169,110,0.35))' }}>⬡</div>
          <h1 className="font-display text-6xl font-semibold tracking-[0.2em] text-yellow-500 mb-2">LUMIÈRE</h1>
          <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase mb-10">Hotel Management System</p>

          <div className="space-y-4 text-left">
            {[
              ['✦', 'Đặt phòng nhanh chóng', 'Tìm kiếm và đặt phòng trong vài giây'],
              ['✦', 'Quản lý tập trung', 'Theo dõi toàn bộ hoạt động khách sạn'],
              ['✦', 'Bảo mật cao', 'Xác thực JWT với phân quyền chi tiết'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-yellow-600 mt-0.5 text-xs">{icon}</span>
                <div>
                  <p className="text-zinc-300 text-sm font-medium">{title}</p>
                  <p className="text-zinc-600 text-xs font-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[520px] flex items-center justify-center p-8 bg-zinc-950 lg:border-l border-zinc-800/60 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-8">
            <span className="text-yellow-500 text-4xl">⬡</span>
            <h1 className="font-display text-3xl font-semibold tracking-widest text-yellow-500 mt-2">LUMIÈRE</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-4xl font-semibold text-zinc-100 mb-2">Tạo tài khoản</h2>
            <p className="text-zinc-500 text-sm font-light">Đăng ký để trải nghiệm dịch vụ đặt phòng cao cấp.</p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              <span className="flex-shrink-0">⚠</span>{serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row: fullName + phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">Họ và tên</label>
                <input name="fullName" type="text" placeholder="Nguyễn Văn A"
                  value={values.fullName} onChange={handleChange} onBlur={handleBlur} autoComplete="name"
                  className={inputCls(touched.fullName && errors.fullName)} />
                {touched.fullName && errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">
                  SĐT <span className="normal-case font-light opacity-60">(tùy chọn)</span>
                </label>
                <input name="phone" type="tel" placeholder="0901234567"
                  value={values.phone} onChange={handleChange} onBlur={handleBlur} autoComplete="tel"
                  className={inputCls(touched.phone && errors.phone)} />
                {touched.phone && errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">Email</label>
              <input name="email" type="email" placeholder="your@email.com"
                value={values.email} onChange={handleChange} onBlur={handleBlur} autoComplete="email"
                className={inputCls(touched.email && errors.email)} />
              {touched.email && errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">Mật khẩu</label>
              <input name="password" type="password" placeholder="Tối thiểu 8 ký tự"
                value={values.password} onChange={handleChange} onBlur={handleBlur} autoComplete="new-password"
                className={inputCls(touched.password && errors.password)} />

              {/* Password strength bars */}
              {values.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= i ? sc.color : 'bg-zinc-700'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium w-20 text-right ${['','text-red-400','text-amber-400','text-yellow-400','text-emerald-400'][strength]}`}>
                    {sc?.label}
                  </span>
                </div>
              )}
              {touched.password && errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">Xác nhận mật khẩu</label>
              <input name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu"
                value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} autoComplete="new-password"
                className={inputCls(touched.confirmPassword && errors.confirmPassword)} />
              {touched.confirmPassword && errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}