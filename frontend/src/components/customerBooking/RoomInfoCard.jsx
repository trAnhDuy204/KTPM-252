import React from 'react';
import { Hotel } from 'lucide-react';

const STATUS_COLOR = {
    AVAILABLE: 'text-emerald-400',
    OCCUPIED: 'text-red-400',
    CLEANING: 'text-sky-400',
    MAINTENANCE: 'text-amber-400',
};

const fmt = (n) =>
    Number(n).toLocaleString('vi-VN') + '₫';

const RoomInfoCard = ({ room }) => {
    return (
        <div className=" border border-zinc-800 rounded-2xl p-6">
            <h2 className=" text-xl font-semibold  mb-4">Thông tin phòng</h2>
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl text-yellow-400 bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center text-2xl flex-shrink-0">
                    <Hotel size={30} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-medium ">{room.hotelName}</p>
                    <p className="text-sm mt-0.5">Phòng {room.roomNumber} - {room.roomTypeName}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-xs px-2.5 py-1 rounded-full border border-green-600/25 bg-green-600/10 text-green-600">
                            {fmt(room.basePrice)} / đêm
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full border border-zinc-700 ${STATUS_COLOR[room.status] ?? 'text-zinc-400'}`}>
                            {room.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomInfoCard;