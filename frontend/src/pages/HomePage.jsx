import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LockKeyhole, Star, ShieldCheck, Bell, Gem, UserRound, Headset, Settings, LogIn} from 'lucide-react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}


const FEATURES = [
  {
    icon: <Building2/>,
    title: 'Đặt phòng tức thì',
    desc: 'Tìm kiếm và đặt phòng trong vài giây. Xác nhận ngay lập tức, không chờ đợi.',
  },
  {
    icon: <LockKeyhole />,
    title: 'Bảo mật tuyệt đối',
    desc: 'Xác thực JWT, phân quyền 3 cấp độ. Dữ liệu của bạn luôn được bảo vệ.',
  },
  {
    icon: <Star />,
    title: 'Đánh giá chân thực',
    desc: 'Hệ thống đánh giá sau check-out. Chỉ khách đã lưu trú mới được nhận xét.',
  },
  {
    icon: <ShieldCheck />,
    title: 'Quản lý toàn diện',
    desc: 'Dashboard riêng cho Admin, Lễ tân và Khách hàng. Mọi thứ trong tầm tay.',
  },
  {
    icon: <Bell />,
    title: 'Thông báo realtime',
    desc: 'Cập nhật trạng thái đặt phòng, xác nhận check-in/out ngay lập tức.',
  },
  {
    icon: <Gem />,
    title: 'Trải nghiệm cao cấp',
    desc: 'Giao diện sang trọng, tối giản. Thiết kế dành riêng cho ngành khách sạn.',
  },
];

const STATS = [
  { value: '500+', label: 'Khách sạn đối tác' },
  { value: '50K+', label: 'Lượt đặt phòng' },
  { value: '4.9★', label: 'Điểm đánh giá' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' },
];

const TESTIMONIALS = [
  {
    name: 'Nguyễn Minh Châu',
    role: 'Quản lý khách sạn',
    avatar: 'NMC',
    text: 'Hệ thống giúp chúng tôi giảm 70% thời gian xử lý đặt phòng. Giao diện lễ tân cực kỳ trực quan.',
    rating: 5,
  },
  {
    name: 'Trần Thị Bảo An',
    role: 'Khách hàng thân thiết',
    avatar: 'TBA',
    text: 'Đặt phòng nhanh chóng, nhận xác nhận ngay. Hệ thống đánh giá rất minh bạch và đáng tin cậy.',
    rating: 5,
  },
  {
    name: 'Lê Quốc Hùng',
    role: 'Giám đốc vận hành',
    avatar: 'LQH',
    text: 'Dashboard admin cho phép theo dõi toàn bộ hoạt động khách sạn theo thời gian thực. Tuyệt vời!',
    rating: 5,
  },
];

const ROLES = [
  {
    icon: <UserRound />,
    role: 'CUSTOMER',
    title: 'Khách hàng',
    color: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60',
    accent: 'text-emerald-400',
    features: ['Tìm kiếm & đặt phòng', 'Xem lịch sử chuyến đi', 'Viết đánh giá', 'Quản lý hồ sơ cá nhân'],
  },
  {
    icon: <Headset />,
    role: 'RECEPTION',
    title: 'Lễ tân',
    color: 'border-sky-500/30 bg-sky-500/5 hover:border-sky-500/60',
    accent: 'text-sky-400',
    features: ['Quản lý check-in/out', 'Theo dõi trạng thái phòng', 'Xử lý đặt phòng', 'Quản lý dịch vụ'],
  },
  {
    icon: <Settings />,
    role: 'ADMIN',
    title: 'Quản trị viên',
    color: 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60',
    accent: 'text-yellow-400',
    features: ['Quản lý toàn hệ thống', 'Tạo tài khoản nhân viên', 'Báo cáo doanh thu', 'Cấu hình chính sách giá'],
  },
];


export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => {
    if (user) {
      const path = { ADMIN: '/admin', RECEPTION: '/reception' }[user.role] ?? '/dashboard';
      navigate(path);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-body overflow-x-hidden">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/60 py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-yellow-500 text-2xl leading-none">⬡</span>
            <span className="font-display text-2xl font-semibold tracking-[0.15em] text-yellow-500">LUMIÈRE</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Tính năng', href: '#features' },
              { label: 'Vai trò', href: '#roles' },
              { label: 'Đánh giá', href: '#testimonials' },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150">
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={handleCTA}
                className="px-5 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20"
              >
                Vào Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 hover:text-zinc-100 transition-all"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-6 bg-zinc-400 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-zinc-400 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-zinc-400 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 pt-2 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 space-y-4">
            {[
              { label: 'Tính năng', href: '#features' },
              { label: 'Vai trò', href: '#roles' },
              { label: 'Đánh giá', href: '#testimonials' },
            ].map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}
                className="block text-sm text-zinc-400 hover:text-zinc-100 py-1 transition-colors">
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm">
                Đăng nhập
              </button>
              <button onClick={() => { navigate('/register'); setMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg bg-yellow-600 text-zinc-950 text-sm font-medium">
                Đăng ký miễn phí
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">

        {/* Background radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(202,138,4,0.07) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(202,138,4,0.04) 0%, transparent 70%)' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,169,110,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="will-animate animate-slide-up delay-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-600/30 bg-yellow-600/8 text-yellow-400 text-xs font-medium tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Hệ thống quản lý khách sạn hiện đại
          </div>

          {/* Headline */}
          <h1 className="will-animate animate-slide-up delay-150 font-display font-semibold leading-[1.05] mb-6">
            <span className="block text-5xl sm:text-6xl lg:text-8xl text-zinc-100 mb-2">
              Trải nghiệm
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-8xl"
              style={{
                background: 'linear-gradient(135deg, #c9a96e 0%, #f5d78e 40%, #c9a96e 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              đỉnh cao
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-8xl text-zinc-100">
              nghỉ dưỡng
            </span>
          </h1>

          {/* Subheadline */}
          <p className="will-animate animate-slide-up delay-300 text-zinc-400 text-base sm:text-lg lg:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-10">
            Nền tảng quản lý khách sạn toàn diện — đặt phòng, quản lý check-in/out,
            đánh giá khách hàng và báo cáo doanh thu. Tất cả trong một hệ thống.
          </p>

          {/* CTA buttons */}
          <div className="will-animate animate-slide-up delay-450 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto group relative px-8 py-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all duration-200 hover:shadow-2xl hover:shadow-yellow-500/25 hover:scale-[1.02] overflow-hidden"
            >
              <span className="relative z-10">
                {user ? '→ Vào Dashboard' : 'Bắt đầu miễn phí'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-700 text-zinc-300 text-sm 
                        hover:border-yellow-600/50 hover:text-yellow-400 transition-all duration-200 flex items-center gap-2"
            >
              Đăng nhập <LogIn />
            </button>
          </div>

          {/* Trust line */}
          <p className="will-animate animate-slide-up delay-600 mt-8 text-xs text-zinc-600 tracking-widest uppercase">
            Được tin dùng bởi 500+ khách sạn trên toàn quốc
          </p>

          {/* Floating visual */}
          <div className="will-animate animate-slide-up delay-450 mt-16 relative mx-auto max-w-2xl">
            <HeroCard />
          </div>
        </div>
      </section>

      <StatsSection />

      <FeaturesSection />

      <RolesSection navigate={navigate} />

      <TestimonialsSection />

      <FinalCTA navigate={navigate} user={user} />


      <footer className="border-t border-zinc-800/60 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl">⬡</span>
            <span className="font-display text-lg font-semibold tracking-widest text-yellow-500">LUMIÈRE</span>
          </div>
          <p className="text-xs text-zinc-600">© 2025 Lumière Hotel Management System. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => navigate('/login')}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Đăng nhập</button>
            <button onClick={() => navigate('/register')}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Đăng ký</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="relative animate-float">
      {/* Glow rings */}
      <div className="absolute -inset-4 rounded-2xl opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(202,138,4,0.4) 0%, transparent 70%)' }} />

      <div className="relative bg-zinc-900 border border-zinc-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
        {/* Mock header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 h-5 bg-zinc-800 rounded-md mx-4 flex items-center px-3">
            <span className="text-[10px] text-zinc-600">lumiere.hotel/dashboard</span>
          </div>
        </div>

        {/* Mock content */}
        <div className="p-5 bg-zinc-950">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="h-4 w-32 bg-zinc-800 rounded mb-1.5" />
              <div className="h-3 w-20 bg-zinc-800/60 rounded" />
            </div>
            <div className="h-7 w-24 bg-yellow-600/20 border border-yellow-600/30 rounded-lg" />
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { val: '128', label: 'Đặt phòng', color: 'text-yellow-400' },
              { val: '94',  label: 'Check-in',  color: 'text-emerald-400' },
              { val: '4.9', label: 'Đánh giá',  color: 'text-sky-400' },
              { val: '34',  label: 'Phòng trống', color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <div className={`font-display text-xl font-semibold ${s.color}`}>{s.val}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Booking rows */}
          {[
            { room: '301', guest: 'Nguyễn Văn A', status: 'Check-in',  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { room: '205', guest: 'Trần Thị B',   status: 'Đang ở',    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
            { room: '412', guest: 'Lê Quốc C',    status: 'Check-out', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
                  {row.room}
                </div>
                <div className="h-3 rounded" style={{ width: `${60 + i * 20}px`, background: '#27272a' }} />
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${row.color}`}>
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className="py-16 border-y border-zinc-800/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={s.label}
              className={`text-center will-animate ${inView ? 'animate-slide-up' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="font-display text-4xl sm:text-5xl font-semibold text-yellow-500 mb-2">
                {s.value}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, inView] = useInView();
  return (
    <section id="features" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className={`text-center mb-16 will-animate ${inView ? 'animate-slide-up' : ''}`}>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-yellow-600 mb-4">
            Tính năng
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-zinc-100 mb-4">
            Mọi thứ bạn cần
          </h2>
          <p className="text-zinc-500 text-base sm:text-lg font-light max-w-xl mx-auto">
            Từ đặt phòng đến quản lý vận hành, tất cả được tích hợp liền mạch trong một nền tảng.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className={`will-animate ${inView ? 'animate-slide-up' : ''} group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-yellow-600/30 hover:bg-zinc-900 transition-all duration-300`}
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {f.icon}
              </div>
              <h3 className="text-base font-medium text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection({ navigate }) {
  const [ref, inView] = useInView();
  return (
    <section id="roles" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
      <div className="max-w-7xl mx-auto">

        <div className={`text-center mb-16 will-animate ${inView ? 'animate-slide-up' : ''}`}>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-yellow-600 mb-4">
            Vai trò
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-zinc-100 mb-4">
            Dành cho mọi người dùng
          </h2>
          <p className="text-zinc-500 text-base font-light max-w-xl mx-auto">
            Mỗi vai trò có giao diện và quyền hạn riêng biệt, tối ưu cho từng công việc.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map((r, i) => (
            <div key={r.role}
              className={`will-animate ${inView ? 'animate-slide-up' : ''} relative p-7 rounded-2xl border transition-all duration-300 cursor-default ${r.color}`}
              style={{ animationDelay: `${i * 120}ms` }}>

              <div className="text-4xl mb-5">{r.icon}</div>
              <h3 className={`font-display text-2xl font-semibold mb-4 ${r.accent}`}>{r.title}</h3>

              <ul className="space-y-2.5">
                {r.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <span className={`text-xs ${r.accent}`}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [ref, inView] = useInView();
  return (
    <section id="testimonials" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className={`text-center mb-16 will-animate ${inView ? 'animate-slide-up' : ''}`}>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-yellow-600 mb-4">
            Nhận xét
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-zinc-100 mb-4">
            Khách hàng nói gì?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name}
              className={`will-animate ${inView ? 'animate-slide-up' : ''} p-7 rounded-2xl border border-zinc-800 bg-zinc-900/50`}
              style={{ animationDelay: `${i * 100}ms` }}>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed italic mb-6">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-yellow-600/20 border border-yellow-600/30 flex items-center justify-center text-xs font-semibold text-yellow-400 flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{t.name}</p>
                  <p className="text-xs text-zinc-600">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ navigate, user }) {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className={`will-animate ${inView ? 'animate-slide-up' : ''} relative rounded-3xl overflow-hidden`}>

          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800" />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(202,138,4,0.12) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 border border-yellow-600/20 rounded-3xl pointer-events-none" />

          <div className="relative z-10 text-center px-8 py-16 sm:py-20">
            <div className="text-5xl mb-6 animate-float">⬡</div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-zinc-100 mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg font-light mb-10 max-w-xl mx-auto">
              Tham gia cùng hàng nghìn khách sạn đang sử dụng Lumière để nâng cao trải nghiệm khách hàng.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <button
                  onClick={() => {
                    const path = { ADMIN: '/admin', RECEPTION: '/reception' }[user.role] ?? '/dashboard';
                    navigate(path);
                  }}
                  className="w-full sm:w-auto px-10 py-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all hover:shadow-2xl hover:shadow-yellow-500/25 hover:scale-[1.02]"
                >
                  → Vào Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all hover:shadow-2xl hover:shadow-yellow-500/25 hover:scale-[1.02]"
                  >
                    Đăng ký miễn phí
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl border border-zinc-600 text-zinc-300 text-sm hover:border-yellow-600/50 hover:text-yellow-400 transition-all"
                  >
                    Đã có tài khoản? Đăng nhập
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}