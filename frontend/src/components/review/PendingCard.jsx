import React from 'react';
import { Building2, Star, MoveRight } from 'lucide-react';

export default function PendingCard({ booking, onReview }) {
  return (
    <div className=" border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex items-center justify-between transition-colors duration-200 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center text-xl flex-shrink-0">
          <Building2 />
        </div>
        <div>
          <p className="text-sm font-medium  mb-0.5">{booking.hotelName}</p>
          <p className="text-xs ">{booking.roomNumber}</p>
          <p className="flex items-center gap-2 text-sm ">
            <span>{booking.checkIn}</span>
            <MoveRight size={16} />
            <span>{booking.checkOut}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400">
          Chờ đánh giá
        </span>
        <button
          onClick={onReview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500
                      text-xs font-medium tracking-widest uppercase
                     transition-all hover:shadow-lg hover:shadow-yellow-500/20 group-hover:scale-[1.02]"
        >
          <Star className="h-4 w-4" />
          Đánh giá
        </button>
      </div>
    </div>
  );
}