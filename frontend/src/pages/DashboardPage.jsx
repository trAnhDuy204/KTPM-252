import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRooms } from '../services/roomApi';
import { getBookings } from '../services/bookingApi';
import { Home, Clipboard, Building2, Star, Plus, X, AlertCircle, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/constants/bookingStatus';
import { pageTitle, pageSubtitle, panelCard, panelRaised, statCard, statLabel } from '@/utils/cls';

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

function StatCard({ Icon, label, value, sub }) {
  return (
    <div className=" border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors duration-200">
      {Icon && <Icon className="w-6 h-6 mb-3 text-yellow-500" />}
      <div className="font-display text-3xl font-semibold  mb-1">{value}</div>
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-zinc-600 mt-1">{sub}</div>}
    </div>
  );
}

function EmptyState({ Icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      {Icon && <Icon className="w-12 h-12 opacity-30 text-zinc-400" />}
      <p className="text-sm text-zinc-500 leading-relaxed">{text}</p>
      {action && (
        <button className="mt-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

const receptionStatTones = {
  available: { icon: 'text-success', value: 'text-success' },
  occupied: { icon: 'text-danger', value: 'text-danger' },
  checkinToday: { icon: 'text-info', value: 'text-info' },
  checkoutToday: { icon: 'text-warning', value: 'text-warning' },
};

function ReceptionStatCard({ Icon, label, value, tone }) {
  return (
    <div className={`${statCard} ${tone?.bg || ""} text-center`}>
      
      {Icon && (
        <Icon className={`w-5 h-5 mx-auto mb-2 ${tone?.icon}`} />
      )}

      <span
        className={`block text-3xl font-semibold leading-tight ${tone?.value || "text-hi"}`}
      >
        {value}
      </span>

      <span className={statLabel}>{label}</span>
    </div>
  );
}

/*Customer Dashboard*/
export function CustomerDashboard() {
  const { user } = useAuth();


  return (
    <>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold  mb-1">
              Xin chào, {user?.fullName}
            </h1>
            <p className="text-zinc-500 text-sm">Khám phá và đặt phòng khách sạn yêu thích của bạn</p>
          </div>
          <RoleBadge role={user?.role} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard Icon={Clipboard} label="Tổng đặt phòng" value="0" sub="Chưa có lịch sử" />
          <StatCard Icon={CheckCircle2} label="Đã hoàn thành" value="0" />
          <StatCard Icon={AlertCircle} label="Chờ xác nhận" value="0" />
          <StatCard Icon={Star} label="Đánh giá" value="0" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className=" border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Đặt phòng gần đây</h3>
            <EmptyState Icon={Building2} text={"Chưa có đặt phòng nào.\nHãy khám phá các khách sạn ngay!"} action="Tìm khách sạn" />
          </div>
          <div className=" border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Khách sạn yêu thích</h3>
            <EmptyState Icon={Star} text="Chưa có khách sạn yêu thích." />
          </div>
        </div>
    </>
  );
}

/*Reception Dashboard*/

export function ReceptionDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ available: 0, occupied: 0, checkinToday: 0, checkoutToday: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const hotelId = user?.hotelId || null;

    getRooms(hotelId).then(res => {
      const rooms = res.data;
      setStats(s => ({
        ...s,
        available: rooms.filter(r => r.status === 'AVAILABLE').length,
        occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
      }));
    }).catch(() => {});

    getBookings(hotelId).then(res => {
      const bookings = res.data;
      const today = new Date().toISOString().split('T')[0];
      setStats(s => ({
        ...s,
        checkinToday: bookings.filter(b => b.checkIn === today && b.status === 'CHECKED_IN').length,
        checkoutToday: bookings.filter(b => b.checkOut === today && b.status === 'COMPLETED').length,
      }));
      setRecentBookings(bookings.slice(0, 5));
    }).catch(() => {});
  }, [user?.hotelId]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitle}>Quầy Lễ tân</h1>
          <p className={`${pageSubtitle} mt-1`}>
            Khách sạn #{user?.hotelId} · {user?.fullName}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent-soft/75 px-3 py-1 text-xs font-semibold text-accent">
          Lễ tân
        </span>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReceptionStatCard
          Icon={CheckCircle2}
          label="Phòng trống"
          value={stats.available}
          tone={receptionStatTones.available}
        />
        <ReceptionStatCard
          Icon={AlertCircle}
          label="Đang sử dụng"
          value={stats.occupied}
          tone={receptionStatTones.occupied}
        />
        <ReceptionStatCard
          Icon={Clipboard}
          label="Check-in hôm nay"
          value={stats.checkinToday}
          tone={receptionStatTones.checkinToday}
        />
        <ReceptionStatCard
          Icon={Clipboard}
          label="Check-out hôm nay"
          value={stats.checkoutToday}
          tone={receptionStatTones.checkoutToday}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <div className={`${panelCard} p-6`}>
          <h3 className="mb-4 text-base font-semibold text-hi">Booking gần đây</h3>
          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <Clipboard className="h-12 w-12 text-ghost opacity-40" />
              <p className="text-sm text-muted">Chưa có booking nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className={`${panelRaised} flex items-center justify-between gap-3 px-4 py-3`}
                >
                  <div>
                    <p className="text-sm font-semibold text-dim">Phòng {b.roomNumber}</p>
                    <p className="text-xs text-muted">{b.guestName}</p>
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: BOOKING_STATUS_COLORS[b.status] }}
                  >
                    {BOOKING_STATUS_LABELS[b.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${panelCard} p-6`}>
          <h3 className="mb-4 text-base font-semibold text-hi">Thống kê nhanh</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-dim">
              <span>Tổng phòng trống</span>
              <span className="font-semibold text-success">{stats.available}</span>
            </div>
            <div className="flex items-center justify-between text-dim">
              <span>Đang sử dụng</span>
              <span className="font-semibold text-danger">{stats.occupied}</span>
            </div>
            <div className="flex items-center justify-between text-dim">
              <span>Check-in hôm nay</span>
              <span className="font-semibold text-info">{stats.checkinToday}</span>
            </div>
            <div className="flex items-center justify-between text-dim">
              <span>Check-out hôm nay</span>
              <span className="font-semibold text-warning">{stats.checkoutToday}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/*Admin Dashboard*/

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold mb-1">Quản trị hệ thống</h1>
            <p className="text-zinc-500 text-sm">Xin chào, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={user?.role} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard Icon={Building2} label="Khách sạn" value="—" />
          <StatCard Icon={Users} label="Nhân viên" value="—" />
          <StatCard Icon={Clipboard} label="Đặt phòng tháng này" value="—" />
          <StatCard Icon={TrendingUp} label="Doanh thu" value="—" />
        </div>

        <div className=" border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4">Quản lý nhân viên</h3>
          <EmptyState Icon={Users} text={"Chưa có nhân viên nào.\nNhấn " + "Thêm nhân viên để tạo tài khoản."} />
        </div>
    </>
  );
}
