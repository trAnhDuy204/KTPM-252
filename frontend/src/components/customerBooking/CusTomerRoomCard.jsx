import React from "react";
import { useNavigate } from "react-router-dom";
import { BedSingle, MapPinHouse} from "lucide-react";

//Room Card
export default function CusTomerRoomCard({ room }) {
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
        <button className="px-3 py-2 rounded-lg border border-zinc-700 text-xs hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          onClick={()=> navigate(`/dashboard/room-detail/${room.id}`)}
        >
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