import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Home, LogOut, DoorOpen, ClipboardList, Sun, Moon, Building2 } from "lucide-react";

const navItems = [
  { Icon: Home, label: "Tổng quan", path: "/reception" },
  { Icon: ClipboardList, label: "Check-in / out", path: "/reception/check-in-out" },
  { Icon: DoorOpen, label: "Phòng", path: "/reception/rooms" },
];

export default function ReceptionLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col fixed top-0 left-0">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-yellow-500" />
            <span className="font-display text-xl font-semibold tracking-widest text-yellow-500">
              LUMIÈRE
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                  active
                    ? "bg-yellow-600/15 text-yellow-500"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer: theme toggle + user + logout */}
        <div className="p-3 border-t border-zinc-800 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors duration-150"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {theme === "dark" ? "Sáng" : "Tối"}
          </button>

          {/* User info */}
          <div className="px-3 py-2">
            <p className="text-xs text-zinc-400 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-zinc-600 truncate">{user?.email}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
