import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRooms } from '../services/roomApi';
import { getBookings } from '../services/bookingApi';
import { adminApi } from '../services/adminApi';
import { profileApi } from '../services/profileApi';
import { Clipboard, User, Calendar, Star, Search, AlertCircle, CheckCircle2, Users, TrendingUp, Hotel, CircleEllipsis, MoveRight, ChevronRightIcon } from 'lucide-react';
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

const STATUS_CFG = {
  PENDING: { label: 'Chờ xác nhận', dot: 'bg-amber-400', text: 'text-amber-400', bar: 'bg-amber-500/20 border-amber-500/25' },
  CONFIRMED: { label: 'Đã xác nhận', dot: 'bg-sky-400', text: 'text-sky-400', bar: 'bg-sky-500/20   border-sky-500/25' },
  CHECKED_IN: { label: 'Đang ở', dot: 'bg-emerald-400', text: 'text-emerald-400', bar: 'bg-emerald-500/20 border-emerald-500/25' },
  COMPLETED: { label: 'Hoàn thành', dot: 'bg-zinc-500', text: 'text-zinc-400', bar: 'bg-zinc-500/10  border-zinc-700' },
  CANCELLED: { label: 'Đã hủy', dot: 'bg-red-500', text: 'text-red-400', bar: 'bg-red-500/10   border-red-500/25' },
};

function BookingRow({ booking, navigate }) {
  const cfg = STATUS_CFG[booking.status] ?? STATUS_CFG.PENDING;
  console.log(booking);

  return (
    <div
      className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/40 transition-colors cursor-pointer group"
      onClick={() => navigate(`/dashboard/room-detail/${booking.roomId}`, { state: { booking } })}
    >
      {/* Hotel icon */}
      <div className="w-10 h-10 rounded-xl border border-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
        <Hotel />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{booking.hotelName}</p>
        <p className="text-xs mt-0.5 flex items-center gap-1 flex-wrap">
          <span>
            {booking.roomNumber}
            {booking.roomTypeName && booking.roomTypeName !== '—' && ` - ${booking.roomTypeName}`}
          </span>

          <span className="mx-1.5 text-zinc-700">-</span>

          <span className="flex items-center gap-1">
            {booking.checkIn}
            <MoveRight className="w-3 h-3" />
            {booking.checkOut}
          </span>
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.bar}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
          <span className={cfg.text}>{cfg.label}</span>
        </span>
        {booking.totalPrice && (
          <span className="text-xs text-zinc-500 tabular-nums">
            {fmtVND(booking.totalPrice)}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyBookings({ onExplore }) {
  return (
    <div className="flex flex-col items-center py-14 px-6 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl border border-zinc-700 flex items-center justify-center text-3xl opacity-40">
        <Hotel />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400 mb-1">Chưa có đặt phòng nào</p>
        <p className="text-xs text-zinc-600">Hãy khám phá và đặt phòng khách sạn yêu thích!</p>
      </div>
      <button
        onClick={onExplore}
        className="px-5 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-yellow-500/20"
      >
        Khám phá ngay
      </button>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className=" border border-zinc-800 rounded-2xl p-5 animate-pulse">
      <div className="w-8 h-8  rounded-lg mb-3" />
      <div className="h-8 w-12  rounded mb-1" />
      <div className="h-3 w-20  rounded" />
    </div>
  );
}

function SkeletonBookingRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="w-10 h-10  rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5  rounded w-2/3" />
        <div className="h-3  rounded w-1/2" />
      </div>
      <div className="h-5 w-20  rounded-full" />
    </div>
  );
}

/*Customer Dashboard*/
export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch data ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        profileApi.getBookings(),
        profileApi.getBookingSummary(),
      ]);
      setBookings(bRes.data ?? []);
      setSummary(sRes.data ?? null);
    } catch {
      /* fail silently — hiển thị empty state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Derived data ── */
  const recentBookings = bookings.slice(0, 4);
  const pendingReviews = bookings.filter(b => b.canReview).length;

  /* ── Greeting by time ── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Chào buổi sáng' :
      hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div>
      {/* ══ Hero header ══ */}
      <div>
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(202,138,4,0.06) 0%, transparent 70%)' }} />

        <div className="flex items-start justify-between relative z-10">
          <div>
            {/* Greeting line */}
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-yellow-600 mb-2">
              {greeting}
            </p>
            <h1 className=" text-4xl font-semibold  mb-1 leading-tight">
              {user?.fullName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* ══ Main content ══ */}
      <div className="px-8 py-8 space-y-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : (
              <>
                <StatCard
                  Icon={Clipboard}
                  label="Tổng đặt phòng"
                  value={summary?.total ?? 0}
                  sub={summary?.total === 0 ? 'Chưa có lịch sử' : undefined}
                />
                <StatCard
                  Icon={CheckCircle2}
                  label="Hoàn thành"
                  value={summary?.completed ?? 0}
                  highlight={summary?.completed > 0}
                />
                <StatCard
                  Icon={CircleEllipsis}
                  label="Chờ xác nhận"
                  value={summary?.pending ?? 0}
                  pulse={summary?.pending > 0}
                />
                <StatCard
                  Icon={Star}
                  label="Chờ đánh giá"
                  value={pendingReviews}
                  sub={pendingReviews > 0 ? 'Có thể đánh giá' : undefined}
                />
              </>
            )
          }
        </div>

        {/* ── Two column: Recent bookings + Quick actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Recent bookings */}
          <div className=" border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-medium ">Đặt phòng gần đây</h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {bookings.length > 0 ? `${bookings.length} đặt phòng` : 'Lịch sử 30 ngày gần nhất'}
                </p>
              </div>
              {bookings.length > 0 && (
                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  Xem tất cả
                </button>
              )}
            </div>

            {loading ? (
              <div className="divide-y divide-zinc-800">
                {[1, 2, 3].map(i => <SkeletonBookingRow key={i} />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <EmptyBookings onExplore={() => navigate('/dashboard/hotels')} />
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {recentBookings.map(b => (
                  <BookingRow key={b.id} booking={b} navigate={navigate} />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Quick actions */}
            <div className=" border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-xs font-medium uppercase tracking-widest mb-4">
                Thao tác nhanh
              </h3>
              <div className="space-y-2">
                {[
                  { icon: <Search />, label: 'Khám phá khách sạn', desc: 'Tìm phòng phù hợp', path: '/dashboard/hotels', color: 'hover:border-yellow-600/40 hover:bg-yellow-600/5' },
                  { icon: <Calendar />, label: 'Lịch sử đặt phòng', desc: 'Xem tất cả booking', path: '/dashboard/profile', color: 'hover:border-sky-600/40 hover:bg-sky-600/5' },
                  { icon: <Star />, label: 'Viết đánh giá', desc: `${pendingReviews} chuyến chờ review`, path: '/dashboard/reviews', color: 'hover:border-amber-600/40 hover:bg-amber-600/5' },
                  { icon: <User />, label: 'Cập nhật hồ sơ', desc: 'Thông tin & mật khẩu', path: '/dashboard/profile', color: 'hover:border-emerald-600/40 hover:bg-emerald-600/5' },
                ].map(({ icon, label, desc, path, color }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 transition-all duration-150 group text-left ${color}`}
                  >
                    <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-150">
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm transition-colors leading-none mb-0.5">
                        {label}
                      </p>
                      <p className="text-xs text-zinc-600">{desc}</p>
                    </div>
                    <span className="ml-auto text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm"><ChevronRightIcon /></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pending review nudge */}
            {pendingReviews > 0 && (
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 text-amber-300"><Star /></span>
                  <div>
                    <p className="text-sm font-medium text-amber-300 mb-1">
                      Bạn có {pendingReviews} chuyến chờ đánh giá
                    </p>
                    <p className="text-xs text-amber-500/70 mb-3">
                      Chia sẻ trải nghiệm giúp khách hàng khác lựa chọn tốt hơn.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/reviews')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 transition-colors"
                    >
                      Đánh giá ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
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
          Icon={Hotel}
          label="Khách sạn"
          value={hotels.length}
          sub="Đang hoạt động"
          loading={loading}
          accent="indigo"
        />
        <StatCard
          Icon={Users}
          label="Nhân viên"
          value={staff.length}
          sub="Lễ tân & Quản trị"
          loading={loading}
          accent="violet"
        />
        <StatCard
          Icon={Clipboard}
          label="Đặt phòng"
          value={bookingsThisMonth.length}
          sub={monthLabel}
          loading={loading}
          accent="sky"
        />
        <StatCard
          Icon={TrendingUp}
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
