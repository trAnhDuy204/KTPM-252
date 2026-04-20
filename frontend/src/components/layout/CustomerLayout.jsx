import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Building2,
  Clipboard,
  Star,
  User,
  Home,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

const navItems = [
  { Icon: Home, label: "Tổng quan", path: "/dashboard" },
  { Icon: Clipboard, label: "Khách sạn", path: "/dashboard/hotels" },
  { Icon: Star, label: 'Đánh giá' ,path: '/dashboard/reviews' },
  { Icon: User, label: 'Hồ sơ', path: '/' },
];

const ROLE_LABELS = { ADMIN: "Admin", RECEPTION: "Reception", CUSTOMER: "Customer" };

function Brand({ role }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft/80 text-accent">
        <Building2 className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold tracking-[0.18em] text-accent">
          LUMIÈRE
        </p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ghost">
          {ROLE_LABELS[role] ?? role}
        </p>
      </div>
    </div>
  );
}

function DesktopNav({ pathname, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {navItems.map(({ Icon, label, path }) => {
        const active =
          pathname === path ||
          (path !== "/dashboard" && pathname.startsWith(`${path}/`));

        return (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              active
                ? "border border-accent/15 bg-accent-soft/85 text-accent shadow-sm shadow-black/[0.04]"
                : "border border-transparent text-muted hover:border-edge hover:bg-raised hover:text-hi"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function MobileNav({ pathname, onNavigate }) {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-30 grid grid-cols-3 gap-2 rounded-2xl border border-edge bg-card/95 p-2 shadow-xl shadow-black/10 backdrop-blur lg:hidden">
      {navItems.map(({ Icon, label, path }) => {
        const active =
          pathname === path ||
          (path !== "/dashboard" && pathname.startsWith(`${path}/`));

        return (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all ${
              active
                ? "bg-accent-soft/90 text-accent"
                : "text-muted hover:bg-raised hover:text-hi"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-center leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ThemeButton({ theme, toggleTheme, compact = false }) {
  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Sáng" : "Tối";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Chuyển sang giao diện ${label.toLowerCase()}`}
      className={`inline-flex items-center gap-2 rounded-xl border border-edge bg-raised text-dim transition-all duration-200 hover:border-edge-md hover:bg-raised-2 hover:text-hi ${
        compact ? "h-11 w-11 justify-center" : "w-full px-4 py-3 text-sm font-medium"
      }`}
    >
      <Icon className="h-5 w-5" />
      {!compact && label}
    </button>
  );
}

export default function CustomerLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface text-hi">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-edge bg-card/95 backdrop-blur lg:flex">
        <div className="border-b border-edge px-5 py-5">
          <Brand role={user?.role} />
        </div>

        <DesktopNav pathname={location.pathname} onNavigate={navigate} />

        <div className="border-t border-edge p-4">
          <ThemeButton theme={theme} toggleTheme={toggleTheme} />

          <div className="mt-4 rounded-xl border border-edge bg-raised/70 px-4 py-3">
            <p className="truncate text-sm font-semibold text-dim">{user?.fullName}</p>
            <p className="mt-1 truncate text-xs text-ghost">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 inline-flex w-full items-center gap-2 rounded-xl border border-danger/15 bg-danger-soft/20 px-4 py-3 text-sm font-medium text-danger transition-all duration-200 hover:border-danger/35 hover:bg-danger-soft/40"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-edge bg-card/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand role={user?.role} />
          <div className="flex items-center gap-2">
            <ThemeButton theme={theme} toggleTheme={toggleTheme} compact />
            <button
              onClick={handleLogout}
              aria-label="Đăng xuất"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-danger/15 bg-danger-soft/20 text-danger transition-all duration-200 hover:border-danger/35 hover:bg-danger-soft/40"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <p className="truncate text-sm font-semibold text-dim">{user?.fullName}</p>
          <p className="truncate text-xs text-ghost">{user?.email}</p>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <MobileNav pathname={location.pathname} onNavigate={navigate} />
    </div>
  );
}
