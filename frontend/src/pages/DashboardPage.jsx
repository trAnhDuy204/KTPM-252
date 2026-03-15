import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/*Shared components*/

const roleMeta = {
  CUSTOMER:  { label: 'Khách hàng',    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  RECEPTION: { label: 'Lễ tân',        color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  ADMIN:     { label: 'Quản trị viên', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
};

function RoleBadge({ role }) {
  const m = roleMeta[role] || roleMeta.CUSTOMER;
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${m.color}`}>
      {m.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors duration-200">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-display text-3xl font-semibold text-zinc-100 mb-1">{value}</div>
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-zinc-600 mt-1">{sub}</div>}
    </div>
  );
}

function Sidebar({ navItems, onLogout }) {
  const navigate = useNavigate();
  return (
    <aside className="w-56 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col fixed top-0 left-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="text-yellow-500 text-2xl leading-none">⬡</span>
          <span className="font-display text-xl font-semibold tracking-widest text-yellow-500">LUMIÈRE</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ icon, label, active }) => (
          <button key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
              active
                ? 'bg-yellow-600/15 text-yellow-500'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
            }`}>
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-800">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150">
          <span className="text-base w-5 text-center">←</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function EmptyState({ icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <span className="text-4xl opacity-30">{icon}</span>
      <p className="text-sm text-zinc-500 leading-relaxed">{text}</p>
      {action && (
        <button className="mt-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

/*Customer Dashboard*/

export function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { icon: '🏠', label: 'Tổng quan', active: true },
    { icon: '📅', label: 'Đặt phòng' },
    { icon: '🏨', label: 'Khách sạn' },
    { icon: '⭐', label: 'Đánh giá' },
    { icon: '👤', label: 'Hồ sơ' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar navItems={nav} onLogout={() => { logout(); navigate('/login'); }} />

      <main className="flex-1 ml-56 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-zinc-100 mb-1">
              Xin chào, {user?.fullName} 👋
            </h1>
            <p className="text-zinc-500 text-sm">Khám phá và đặt phòng khách sạn yêu thích của bạn</p>
          </div>
          <RoleBadge role={user?.role} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Tổng đặt phòng" value="0" sub="Chưa có lịch sử" />
          <StatCard icon="✅" label="Đã hoàn thành" value="0" />
          <StatCard icon="⏳" label="Chờ xác nhận" value="0" />
          <StatCard icon="⭐" label="Đánh giá" value="0" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Đặt phòng gần đây</h3>
            <EmptyState icon="🏨" text={"Chưa có đặt phòng nào.\nHãy khám phá các khách sạn ngay!"} action="Tìm khách sạn" />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Khách sạn yêu thích</h3>
            <EmptyState icon="❤️" text="Chưa có khách sạn yêu thích." />
          </div>
        </div>
      </main>
    </div>
  );
}

/*Reception Dashboard*/

export function ReceptionDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { icon: '🏠', label: 'Tổng quan', active: true },
    { icon: '📋', label: 'Đặt phòng' },
    { icon: '🚪', label: 'Phòng' },
    { icon: '👥', label: 'Khách hàng' },
    { icon: '🧾', label: 'Dịch vụ' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar navItems={nav} onLogout={() => { logout(); navigate('/login'); }} />

      <main className="flex-1 ml-56 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-zinc-100 mb-1">Quầy Lễ tân</h1>
            <p className="text-zinc-500 text-sm">Khách sạn #{user?.hotelId} · {user?.fullName}</p>
          </div>
          <RoleBadge role={user?.role} />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon="🟢" label="Phòng trống" value="—" sub="Kết nối dữ liệu" />
          <StatCard icon="🔴" label="Đang sử dụng" value="—" />
          <StatCard icon="📥" label="Check-in hôm nay" value="—" />
          <StatCard icon="📤" label="Check-out hôm nay" value="—" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Đặt phòng chờ xác nhận</h3>
            <EmptyState icon="📋" text="Không có yêu cầu đang chờ." />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Hoạt động gần đây</h3>
            <EmptyState icon="📊" text="Chưa có hoạt động." />
          </div>
        </div>
      </main>
    </div>
  );
}

/*Admin Dashboard*/

export function AdminDashboard() {
  const { user, logout, createStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'RECEPTION', hotelId: '' });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const nav = [
    { icon: '🏠', label: 'Tổng quan', active: true },
    { icon: '🏨', label: 'Khách sạn' },
    { icon: '👥', label: 'Nhân viên' },
    { icon: '📊', label: 'Báo cáo' },
    { icon: '⚙️', label: 'Cài đặt' },
  ];

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(''); setSuccessMsg('');
    try {
      const payload = { ...form, hotelId: form.hotelId ? Number(form.hotelId) : null };
      await createStaff(payload);
      setSuccessMsg(`Tạo tài khoản ${form.role} thành công!`);
      setForm({ fullName: '', email: '', password: '', phone: '', role: 'RECEPTION', hotelId: '' });
      setTimeout(() => { setShowModal(false); setSuccessMsg(''); }, 1500);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm font-light outline-none placeholder:text-zinc-600 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10 transition-all';

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar navItems={nav} onLogout={() => { logout(); navigate('/login'); }} />

      <main className="flex-1 ml-56 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-zinc-100 mb-1">Quản trị hệ thống</h1>
            <p className="text-zinc-500 text-sm">Xin chào, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={user?.role} />
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20">
              + Thêm nhân viên
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon="🏨" label="Khách sạn" value="—" />
          <StatCard icon="👥" label="Nhân viên" value="—" />
          <StatCard icon="📅" label="Đặt phòng tháng này" value="—" />
          <StatCard icon="💰" label="Doanh thu" value="—" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Quản lý nhân viên</h3>
          <EmptyState icon="👥" text={"Chưa có nhân viên nào.\nNhấn " + "Thêm nhân viên để tạo tài khoản."} />
        </div>
      </main>

      {/*Modal tạo nhân viên*/}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl w-full max-w-md shadow-2xl"
            style={{ animation: 'fadein 0.2s ease' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <h2 className="font-display text-2xl font-semibold text-zinc-100">Tạo tài khoản nhân viên</h2>
              <button onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-lg transition-colors leading-none">✕</button>
            </div>

            <div className="px-6 py-5">
              {formError && (
                <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                  <span>⚠</span>{formError}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm">
                  <span>✓</span>{successMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-1.5">Họ tên</label>
                    <input required placeholder="Nguyễn Văn B" value={form.fullName}
                      onChange={e => set('fullName', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-1.5">Điện thoại</label>
                    <input placeholder="0901234567" value={form.phone}
                      onChange={e => set('phone', e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-1.5">Email</label>
                  <input required type="email" placeholder="staff@hotel.com" value={form.email}
                    onChange={e => set('email', e.target.value)} className={inputCls} />
                </div>

                <div>
                  <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-1.5">Mật khẩu</label>
                  <input required type="password" placeholder="Tối thiểu 8 ký tự" value={form.password}
                    onChange={e => set('password', e.target.value)} className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-1.5">Vai trò</label>
                    <select value={form.role} onChange={e => set('role', e.target.value)}
                      className={inputCls + ' appearance-none cursor-pointer'}>
                      <option value="RECEPTION">Lễ tân</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  {form.role === 'RECEPTION' && (
                    <div>
                      <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-1.5">ID Khách sạn</label>
                      <input required type="number" placeholder="1" value={form.hotelId}
                        onChange={e => set('hotelId', e.target.value)} className={inputCls} />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading}
                    className="px-5 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading
                      ? <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}