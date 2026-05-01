import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRooms } from '../services/roomApi';
import { getBookings } from '../services/bookingApi';
import { adminApi } from '../services/adminApi';
import { Clipboard, Building2, Star, AlertCircle, CheckCircle2, Users, TrendingUp, Hotel } from 'lucide-react';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/constants/bookingStatus';
import { pageTitle, pageSubtitle, panelCard, panelRaised, statCard, statLabel } from '@/utils/cls';

/*Shared components*/
const roleMeta = {
  CUSTOMER: { label: 'Khách hàng', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  RECEPTION: { label: 'Lễ tân', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  ADMIN: { label: 'Quản trị viên', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
};

function RoleBadge({ role }) {
  const m = roleMeta[role] || roleMeta.CUSTOMER;
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${m.color}`}>
      {m.label}
    </span>
  );
}

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 22V12h6v10M9 7h1m4 0h1M9 11h1m4 0h1" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
const IconTrend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    className="w-4 h-4 animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n ?? 0);

const isThisMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const STATUS_MAP = {
  PENDING: { label: "Chờ xác nhận", cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  CHECKED_IN: { label: "Đang ở", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Hoàn thành", cls: "bg-zinc-100 text-zinc-600" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-zinc-100 text-zinc-500" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-50">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-3.5">
          <div className="h-3 bg-zinc-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CHECKED_IN", label: "Đang ở" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function StatCard({ Icon, label, value, sub }) {
  return (
    <div className=" border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors duration-200">
      {Icon && <Icon className="w-6 h-6 mb-3 text-yellow-500" />}
      <div className=" text-3xl font-semibold  mb-1">{value}</div>
      <div className="text-xs font-medium  uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs  mt-1">{sub}</div>}
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
          <h1 className="text-3xl font-semibold  mb-1">
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
    }).catch(() => { });

    getBookings(hotelId).then(res => {
      const bookings = res.data;
      const today = new Date().toISOString().split('T')[0];
      setStats(s => ({
        ...s,
        checkinToday: bookings.filter(b => b.checkIn === today && b.status === 'CHECKED_IN').length,
        checkoutToday: bookings.filter(b => b.checkOut === today && b.status === 'COMPLETED').length,
      }));
      setRecentBookings(bookings.slice(0, 5));
    }).catch(() => { });
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

  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [hotelsRes, usersRes, bookingsRes] = await Promise.all([
        adminApi.getHotels(),
        adminApi.getUsers(),
        adminApi.getBookings(),
      ]);

      // Axios bọc data trong .data; hỗ trợ cả response thô
      const normalize = (res) => {
        const d = res?.data ?? res;
        return Array.isArray(d) ? d : (d?.content ?? d?.items ?? []);
      };

      setHotels(normalize(hotelsRes));
      setUsers(normalize(usersRes));
      setBookings(normalize(bookingsRes));
      setLastSync(new Date());
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Tính stats
  const staff = users.filter(u => u.role === "RECEPTION" || u.role === "ADMIN");

  const bookingsThisMonth = bookings.filter(b =>
    isThisMonth(b.createdAt ?? b.checkIn)
  );

  const revenueThisMonth = bookingsThisMonth
    .filter(b => ["COMPLETED", "CONFIRMED", "CHECKED_IN"].includes(b.status))
    .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

  // Lọc + sắp xếp bảng
  const filteredBookings = (statusFilter
    ? bookings.filter(b => b.status === statusFilter)
    : bookings
  )
    .sort((a, b) => new Date(b.createdAt ?? b.checkIn) - new Date(a.createdAt ?? a.checkIn))
    .slice(0, 10);

  const now = new Date();
  const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  return (
    <div className="min-h-screen  p-6 md:p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold  mb-1">Quản trị hệ thống</h1>
          <p className=" text-sm">
            Xin chào, <span className="font-medium ">{user?.fullName}</span>
            {lastSync && (
              <span className="ml-2 ">
                · Cập nhật lúc {lastSync.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={user?.role} />
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
          >
            {loading ? <IconSpinner /> : <IconRefresh />}
            Làm mới
          </button>
        </div>
      </div>

      {/*Error*/}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          <span> {error} </span>
          <button onClick={loadData} className="ml-auto underline text-red-600 text-xs">Thử lại</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Hotel}
          label="Khách sạn"
          value={hotels.length}
          sub="Đang hoạt động"
          loading={loading}
          accent="indigo"
        />
        <StatCard
          icon={Users}
          label="Nhân viên"
          value={staff.length}
          sub="Lễ tân & Quản trị"
          loading={loading}
          accent="violet"
        />
        <StatCard
          icon={Clipboard}
          label="Đặt phòng"
          value={bookingsThisMonth.length}
          sub={monthLabel}
          loading={loading}
          accent="sky"
        />
        <StatCard
          icon={TrendingUp}
          label="Doanh thu"
          value={fmtVND(revenueThisMonth)}
          sub={monthLabel}
          loading={loading}
          accent="emerald"
        />
      </div>

      {/* Bảng đặt phòng */}
      <div className={`${panelCard} overflow-hidden`}>
        {/* HEADER */}
        <div className="px-4 py-4 border-b border-edge flex items-center justify-between">
          <h2 className="text-sm font-semibold text-hi">Đặt phòng gần đây</h2>
          <span className="text-xs text-muted">
            {filteredBookings.length} kết quả
          </span>
        </div>

        {/* FILTER */}
        <div className="px-4 py-3 border-b border-edge flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-[11px] px-2.5 py-1 rounded-full transition-all font-semibold tracking-wide
        ${statusFilter === tab.value
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-raised/60"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">

            {/* HEADER */}
            <thead>
              <tr className="bg-raised/85 text-xs uppercase tracking-[0.18em] text-muted">
                <th className="px-4 py-3 text-left font-semibold">Mã ĐP</th>
                <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
                <th className="px-4 py-3 text-left font-semibold">Khách sạn</th>
                <th className="px-4 py-3 text-left font-semibold">Check-in</th>
                <th className="px-4 py-3 text-left font-semibold">Check-out</th>
                <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-edge">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-sm text-muted py-14"
                  >
                    Không có đặt phòng nào.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="bg-card transition-colors hover:bg-raised/45"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      #{b.id}
                    </td>

                    {/* USER */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-hi">
                        {b.user?.fullName ??
                          b.userName ??
                          `Khách #${b.userId}`}
                      </div>
                    </td>

                    {/* HOTEL */}
                    <td className="px-4 py-3 text-dim">
                      {b.hotel?.name ??
                        hotels.find((h) => h.id === b.hotelId)?.name ??
                        "—"}
                    </td>

                    {/* CHECKIN */}
                    <td className="px-4 py-3 text-dim">
                      {b.checkIn}
                    </td>

                    {/* CHECKOUT */}
                    <td className="px-4 py-3 text-dim">
                      {b.checkOut}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-3 text-right font-semibold text-hi">
                      {fmtVND(b.totalPrice)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
