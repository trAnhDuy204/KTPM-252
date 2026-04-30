import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BedSingle, Hotel, MapPinHouse, MoveDown, MoveUp } from "lucide-react";

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-3xl opacity-30 mb-3"><Hotel /></span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

//Room Card
function RoomCard({ room }) {
  const navigate = useNavigate();

  const statusColor = {
    AVAILABLE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    OCCUPIED: 'text-red-400    bg-red-500/10    border-red-500/25',
    CLEANING: 'text-sky-400    bg-sky-500/10    border-sky-500/25',
    MAINTENANCE: 'text-amber-400  bg-amber-500/10  border-amber-500/25',
  }[room.status] ?? 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25';

  const statusLabel = {
    AVAILABLE: 'Còn trống',
    RESERVED: 'Đã được đặt trước',
    OCCUPIED: 'Đang sử dụng',
    CLEANING: 'Đang dọn',
    MAINTENANCE: 'Bảo trì',
  }[room.status] ?? room.status;

  const isBookable = room.status === 'AVAILABLE';

  const handleBook = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }
    // Navigate sang trang đặt phòng, truyền room qua state
    navigate('/dashboard/booking', { state: { room } });
  };

  return (
    <div className=" border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex items-center justify-between transition-colors duration-200 group">

      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center text-xl flex-shrink-0">
          <BedSingle />
        </div>
        <div>
          <p className="text-sm font-medium ">Phòng {room.roomNumber}</p>
          <p className="text-xs">{room.roomTypeName}</p>
          <p className="text-xs mt-1 flex items-center gap-2">
            {room.hotelName && (
              <span className="flex items-center gap-1">
                <MapPinHouse className="w-4 h-4" />
                {room.hotelCity}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Price */}
        <span className="text-[11px] px-2.5 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-600 font-medium">
          {Number(room.basePrice).toLocaleString('vi-VN')}₫ / đêm
        </span>

        {/* Status */}
        <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusColor}`}>
          {statusLabel}
        </span>

        {/* View detail button */}
        <button className="px-3 py-2 rounded-lg border border-zinc-700 text-xs hover:border-zinc-500 hover:text-zinc-200 transition-colors">
          Xem chi tiết
        </button>

        {/* Book button */}
        <button
          onClick={handleBook}
          disabled={!isBookable}
          className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Đặt phòng
        </button>
      </div>
    </div>
  );
}


export default function HotelRoomsApp() {
  const [rooms, setRooms] = useState([]);
  const [originalRooms, setOrig] = useState([]);
  const [roomType, setRoomType] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch('http://localhost:8080/api/public/rooms')
      .then(r => r.json())
      .then(data => { setRooms(data); setOrig(data); })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);


  const handleSort = (order) => {
    setSortOrder(order);
    setRooms(prev => [...prev].sort((a, b) =>
      order === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
    ));
  };


  const filtered = roomType === 'all'
    ? rooms
    : rooms.filter(r => r.roomTypeName?.toLowerCase() === roomType.toLowerCase());


  const grouped = filtered.reduce((acc, room) => {
    const key = room.hotelName ?? 'Khác';
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {});


  const roomTypes = [...new Set(originalRooms.map(r => r.roomTypeName).filter(Boolean))];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold  mb-2">Danh sách phòng</h1>
        <p className="text-zinc-500 text-sm">Chọn phòng phù hợp và đặt ngay</p>
      </div>

      {/* Filter + Sort bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Room type filter */}
        <select
          value={roomType}
          onChange={e => setRoomType(e.target.value)}
          className="border border-zinc-700 text-zinc-950 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-600/70 transition-all cursor-pointer"
        >
          <option value="all">Tất cả loại phòng</option>
          {roomTypes.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
        </select>

        {/* Sort buttons */}
        <button
          onClick={() => handleSort('asc')}
          className={`px-4 py-2 rounded-lg border text-sm transition-colors flex items-center gap-2 ${sortOrder === 'asc'
            ? 'border-yellow-600/50 text-yellow-400 bg-yellow-600/10'
            : 'border-zinc-700 hover:border-zinc-500'}`}
        >
          <MoveUp className="w-4 h-4" />
          <span>Giá tăng dần</span>
        </button>
        <button
          onClick={() => handleSort('desc')}
          className={`px-4 py-2 rounded-lg border text-sm transition-colors flex items-center gap-2 ${sortOrder === 'desc'
              ? 'border-yellow-600/50 text-yellow-400 bg-yellow-600/10'
              : 'border-zinc-700 hover:border-zinc-500'
            }`}
        >
          <MoveDown className="w-4 h-4" />
          <span>Giá giảm dần</span>
        </button>

        {/* Count */}
        <span className="ml-auto text-xs text-zinc-500">
          {filtered.length} phòng
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className=" border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 rounded w-1/3 mb-3" />
              <div className="h-3 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className=" border border-zinc-800 rounded-xl">
          <EmptyState text="Không có phòng nào phù hợp." />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([hotelName, hotelRooms]) => (
            <div key={hotelName}>
              {/* Hotel header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-semibold text-yellow-400"><Hotel size={40} /></span>
                <h2 className=" text-xl font-semibold text-yellow-400">{hotelName}</h2>
                <span className="text-xs text-zinc-600">{hotelRooms.length} phòng</span>
              </div>

              <div className="space-y-3">
                {hotelRooms.map(room => <RoomCard key={room.id} room={room} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}