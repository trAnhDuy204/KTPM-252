import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CusTomerRoomCard from "@/components/customerBooking/CusTomerRoomCard";
import { BedSingle, Hotel, MapPinHouse, MoveDown, MoveUp } from "lucide-react";

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-3xl opacity-30 mb-3"><Hotel /></span>
      <p className="text-sm">{text}</p>
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
                {hotelRooms.map(room => <CusTomerRoomCard key={room.id} room={room} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}