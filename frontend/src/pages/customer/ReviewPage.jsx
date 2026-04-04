import React, { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '../../services/reviewApi';
import ReviewModal from '../../components/review/ReviewModal';
import StarRating from '../../components/review/StarRating';
import { useToast } from '../../components/review/Toast';

function EmptyState({ Icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      {Icon && <Icon className="w-12 h-12 opacity-30 text-zinc-400" />}
      <p className="text-sm text-zinc-500 leading-relaxed">{text}</p>
      {action && (
        <button className="mt-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const { showToast, ToastContainer } = useToast();

  const [activeTab, setActiveTab]           = useState('pending');
  const [reviewableBookings, setReviewable] = useState([]);
  const [myReviews, setMyReviews]           = useState([]);
  const [selectedBooking, setSelected]      = useState(null);
  const [pageLoading, setPageLoading]       = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    setPageLoading(true);
    try {
      const [bookRes, revRes] = await Promise.all([
        reviewApi.getReviewableBookings(),
        reviewApi.getMyReviews(),
      ]);
      setReviewable(bookRes.data);
      setMyReviews(revRes.data);
    } catch {
      showToast('Không tải được dữ liệu. Vui lòng thử lại.', 'error');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Sau khi gửi review thành công
  const handleReviewSuccess = (newReview) => {
    setSelected(null);

    // Cập nhật cờ alreadyReviewed trong danh sách booking
    setReviewable(prev =>
      prev.map(b =>
        b.bookingId === newReview.bookingId ? { ...b, alreadyReviewed: true } : b
      )
    );

    // Thêm review mới vào đầu danh sách
    setMyReviews(prev => [newReview, ...prev]);

    // Chuyển sang tab "Đã đánh giá"
    setActiveTab('done');

    // Toast thông báo thành công
    showToast('Đánh giá của bạn đã được gửi thành công! 🎉', 'success');
  };

  // Xóa review
  const handleDelete = async (reviewId, bookingId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này không?')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      setMyReviews(prev => prev.filter(r => r.id !== reviewId));
      setReviewable(prev =>
        prev.map(b =>
          b.bookingId === bookingId ? { ...b, alreadyReviewed: false } : b
        )
      );
      showToast('Đã xóa đánh giá.', 'info');
    } catch {
      showToast('Không thể xóa đánh giá. Vui lòng thử lại.', 'error');
    }
  };

  const pendingBookings = reviewableBookings.filter(b => !b.alreadyReviewed);
  const doneBookings    = reviewableBookings.filter(b =>  b.alreadyReviewed);

  return (
    <>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold  mb-1">
              Đánh giá của tôi
            </h1>
            <p className="text-zinc-500 text-sm">
              Chia sẻ trải nghiệm để giúp những khách hàng khác
            </p>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2  border border-zinc-800 rounded-xl">
              <p className="font-display text-2xl font-semibold text-yellow-400">
                {pendingBookings.length}
              </p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Chờ đánh giá</p>
            </div>
            <div className="text-center px-4 py-2  border border-zinc-800 rounded-xl">
              <p className="font-display text-2xl font-semibold text-emerald-400">
                {myReviews.length}
              </p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Đã đánh giá</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6  p-1 rounded-xl border border-zinc-800 w-fit">
          {[
            { key: 'pending', label: `Chờ đánh giá`, count: pendingBookings.length },
            { key: 'done',    label: 'Đã đánh giá',  count: myReviews.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === t.key
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === t.key
                    ? 'bg-yellow-600/20 text-yellow-400'
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {pageLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className=" border border-zinc-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Tab: Chờ đánh giá */}
            {activeTab === 'pending' && (
              pendingBookings.length === 0 ? (
                <div className=" border border-zinc-800 rounded-xl">
                  <EmptyState
                    icon="⭐"
                    text={"Không có kỳ nghỉ nào chờ đánh giá.\nCác chuyến đi hoàn thành sẽ xuất hiện ở đây."}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map(booking => (
                    <BookingCard
                      key={booking.bookingId}
                      booking={booking}
                      onReview={() => setSelected(booking)}
                    />
                  ))}
                </div>
              )
            )}

            {/* Tab: Đã đánh giá */}
            {activeTab === 'done' && (
              myReviews.length === 0 ? (
                <div className=" border border-zinc-800 rounded-xl">
                  <EmptyState icon="📝" text="Bạn chưa có đánh giá nào." />
                </div>
              ) : (
                <div className="space-y-3">
                  {myReviews.map(review => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      bookings={reviewableBookings}
                      onDelete={() =>
                        handleDelete(review.id, review.bookingId)
                      }
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}

      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => setSelected(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </>
  );
}

/* BookingCard */
function BookingCard({ booking, onReview }) {
  return (
    <div className=" border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex items-center justify-between transition-colors duration-200 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center text-xl flex-shrink-0">
          🏨
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200 mb-0.5">{booking.hotelName}</p>
          <p className="text-xs text-zinc-500">{booking.roomNumber}</p>
          <p className="text-xs text-zinc-600 mt-1">
            {booking.checkIn} → {booking.checkOut}
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
                     text-zinc-950 text-xs font-medium tracking-widest uppercase
                     transition-all hover:shadow-lg hover:shadow-yellow-500/20 group-hover:scale-[1.02]"
        >
          ★ Đánh giá
        </button>
      </div>
    </div>
  );
}

/* ReviewCard */
function ReviewCard({ review, bookings, onDelete }) {
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
            🏨
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">
              {booking?.hotelName ?? 'Khách sạn'}
            </p>
            <p className="text-xs text-zinc-500">
              {booking?.checkIn} → {booking?.checkOut}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            Đã đánh giá
          </span>
          <button
            onClick={onDelete}
            className="text-zinc-600 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded hover:bg-red-500/10"
            title="Xóa đánh giá"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2 mb-2">
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3 mt-3 italic">
          "{review.comment}"
        </p>
      )}

      <p className="text-xs text-zinc-600 mt-3">{formatDate(review.createdAt)}</p>
    </div>
  );
}