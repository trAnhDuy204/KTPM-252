import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RoomManagement from "@/pages/reception/RoomManagement";
import CheckInOut from "@/pages/reception/CheckInOut";

function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <nav className="bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2">
        <NavLink to="/reception/rooms" className={linkClass}>
          Quản lý phòng
        </NavLink>
        <NavLink to="/reception/check-in-out" className={linkClass}>
          Check-in / Check-out
        </NavLink>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-slate-500">{user.fullName}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/reception/*"
            element={
              <ProtectedRoute allowedRoles={["RECEPTION"]}>
                <Routes>
                  <Route path="rooms" element={<RoomManagement />} />
                  <Route path="check-in-out" element={<CheckInOut />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/reception/rooms" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
