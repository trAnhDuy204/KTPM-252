import React, { useState } from 'react';
import StarRating from './StarRating';
import { reviewApi } from '../../services/reviewApi';
import { Clipboard, Star, X, OctagonAlert, MoveRight } from 'lucide-react';

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await reviewApi.create({
        bookingId: booking.bookingId,
        rating,
        comment: comment.trim() || null,
      });
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabel = ['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Tuyệt vời!'][rating] || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700/60 rounded-2xl w-full max-w-md shadow-2xl"
        style={{ animation: 'fadein 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="font-display text-2xl font-semibold text-zinc-100">
              Đánh giá kỳ nghỉ
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {booking.hotelName} - {booking.roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-xl transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/*  Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Booking info */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/60 rounded-xl border border-zinc-700/40">
            <Clipboard className="h-6 w-6 text-zinc-400" />
            <div>
              <p className="text-xs font-medium text-zinc-400">Thời gian lưu trú</p>
              <p className="flex items-center gap-2 text-sm text-zinc-200">
                <span>{booking.checkIn}</span>
                <MoveRight size={16} />
                <span>{booking.checkOut}</span>
              </p>
            </div>
          </div>

          {/* Star rating */}
          <div className="text-center space-y-2">
            <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500">
              Đánh giá tổng thể
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            <p className={`text-sm font-medium h-5 transition-all ${rating >= 4 ? 'text-emerald-400'
                : rating >= 3 ? 'text-yellow-400'
                  : rating > 0 ? 'text-red-400'
                    : 'text-transparent'
              }`}>
              {ratingLabel}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[11px] font-medium tracking-widest uppercase text-zinc-500 mb-2">
              Nhận xét <span className="normal-case font-light opacity-60">(tùy chọn)</span>
            </label>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="Chia sẻ trải nghiệm của bạn về phòng, dịch vụ, tiện nghi..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3
                         text-zinc-100 text-sm font-light outline-none resize-none
                         placeholder:text-zinc-600 transition-all duration-200
                         focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10"
            />
            <p className="text-right text-xs text-zinc-600 mt-1">
              {comment.length}/2000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              <span className="flex-shrink-0"><OctagonAlert /></span> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm
                         hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-6 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500
                         text-zinc-950 text-sm font-medium tracking-widest uppercase
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20"
            >
              {loading
                ? <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                : <><Star className="h-4 w-4" /> Gửi đánh giá</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}