import React from 'react';
import StarRating from '../../components/review/StarRating';
import { Building2, X, MoveRight } from 'lucide-react';

export default function ReviewCard({ review, bookings, onDelete }) {
  const booking = bookings.find(b => b.bookingId === review.bookingId);

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className=" border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg flex-shrink-0">
            <Building2 className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium ">
              {booking?.hotelName ?? 'Khách sạn'}
            </p>
            <p className="flex items-center gap-2 text-sm ">
              <span>{booking.checkIn}</span>
              <MoveRight size={16} />
              <span>{booking.checkOut}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            Đã đánh giá
          </span>
          <button
            onClick={onDelete}
            className=" hover:text-red-400 text-xs transition-colors px-2 py-1 rounded hover:bg-red-500/10"
            title="Xóa đánh giá"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2 mb-2">
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm  leading-relaxed border-l-2 border-zinc-700 pl-3 mt-3 italic">
          "{review.comment}"
        </p>
      )}

      <p className="text-xs 0 mt-3">{formatDate(review.createdAt)}</p>
    </div>
  );
}