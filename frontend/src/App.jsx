import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RoomManagement from './pages/RoomManagement';
import RoomTypeManagement from './pages/RoomTypeManagement';
import UserManagement from './pages/UserManagement'; 
import HotelManagement from './pages/HotelManagement';

const Sidebar = () => {
  const location = useLocation();
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(true);

  const isActive = (path) => location.pathname === path ? "bg-[#F8F4E1] text-[#842A3B]" : "text-white hover:bg-white/10";

  return (
    <div className="w-72 bg-[#842A3B] min-h-screen shadow-2xl flex flex-col fixed left-0 top-0">
      <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-black text-[#F8F4E1] tracking-tighter uppercase">Hotel Management</h2>
      </div>

      <nav className="flex-1 p-4 mt-4 space-y-2">
        <div>
          <button 
            onClick={() => setIsRoomMenuOpen(!isRoomMenuOpen)}
            className="w-full flex items-center justify-between p-4 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 rounded-2xl transition-all"
          >
            <span className="flex items-center gap-3">Quản lý phòng</span>
            <span className={`transition-transform duration-300 ${isRoomMenuOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isRoomMenuOpen && (
            <div className="ml-6 mt-2 space-y-1 border-l-2 border-white/10 pl-4 animate-fadeIn">
              <Link to="/" className={`block p-3 rounded-xl text-xs font-bold transition-all ${isActive('/')}`}>
                Danh sách phòng
              </Link>
              <Link to="/room-types" className={`block p-3 rounded-xl text-xs font-bold transition-all ${isActive('/room-types')}`}>
                Cấu hình loại phòng & Giá
              </Link>
            </div>
          )}
        </div>

        <Link 
          to="/hotels" 
          className={`flex items-center gap-3 p-4 font-black uppercase text-xs tracking-widest rounded-2xl transition-all ${isActive('/hotels')}`}
        >
          Quản lý khách sạn
        </Link>

        <Link 
          to="/staff" 
          className={`flex items-center gap-3 p-4 font-black uppercase text-xs tracking-widest rounded-2xl transition-all ${isActive('/staff')}`}
        >
          Quản lý nhân viên
        </Link>
      </nav>

      <div className="p-6 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Admin Dashboard</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#F8F4E1]/10">
        <Sidebar />

        <main className="flex-1 ml-72 p-4 transition-all">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<RoomManagement />} />
              <Route path="/room-types" element={<RoomTypeManagement />} />
              <Route path="/hotels" element={<HotelManagement />} />
              <Route path="/staff" element={<UserManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;