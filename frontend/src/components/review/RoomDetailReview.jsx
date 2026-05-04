import React, { useState, useEffect, useRef } from 'react';
import { reviewApi } from '@/services/reviewApi';
import { Star, CircleX } from 'lucide-react';


function Stars({ value, size = 'md' }) {
  const sz = { sm: 'text-sm', md: 'text-base', lg: 'text-xl', xl: 'text-3xl' }[size];
  return (
    <span className="inline-flex gap-0.5 leading-none">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`${sz} ${i <= Math.round(value) ? 'text-yellow-400' : 'text-zinc-700'}`}>
          <Star />
        </span>
      ))}
    </span>
  );
}


function RatingBar({ star, count, total, onClick, active }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 group transition-all ${active ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
    >
      <span className="text-xs w-4 text-right tabular-nums">{star}</span>
      <span className="text-yellow-400 text-xs leading-none"><Star /></span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${active ? 'bg-yellow-400' : 'bg-zinc-600 group-hover:bg-yellow-500/60'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums w-8 text-right">{count}</span>
    </button>
  );
}


function Avatar({ name }) {
  const initials = (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  // Deterministic color from name
  const colors = [
    'bg-yellow-600/20 text-yellow-400 border-yellow-600/25',
    'bg-sky-600/20    text-sky-400    border-sky-600/25',
    'bg-emerald-600/20 text-emerald-400 border-emerald-600/25',
    'bg-rose-600/20   text-rose-400   border-rose-600/25',
    'bg-violet-600/20 text-violet-400 border-violet-600/25',
  ];
  const idx = (name ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 text-xs font-semibold ${colors[idx]}`}>
      {initials}
    </div>
  );
}

function ReviewCard({ review, index }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (review.comment ?? '').length > 160;
  const shown  = (!isLong || expanded) ? review.comment : review.comment.slice(0, 160) + '…';

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  return (
    <div
      className="group p-5 rounded-2xl border border-zinc-800/80
                 hover:border-zinc-700 hover:bg-zinc-500 transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={review.userFullName} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {review.userFullName ?? 'Khách hàng'}
            </p>
            <p className="text-[11px] mt-0.5">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Stars badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-yellow-600/20 bg-yellow-600/8 flex-shrink-0">
          <span className="text-yellow-400 text-sm leading-none"><Star /></span>
          <span className="text-xs font-semibold text-yellow-400 tabular-nums">
            {review.rating}
          </span>
        </div>
      </div>

      {/* Comment */}
      {review.comment ? (
        <div>
          <p className="text-sm leading-relaxed">{shown}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-1.5 text-xs text-yellow-600 hover:text-yellow-400 transition-colors"
            >
              {expanded ? 'Thu gọn ' : 'Đọc thêm '}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm italic">Không có nhận xét.</p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-zinc-800 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl  flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5  rounded w-1/3" />
          <div className="h-3  rounded w-1/5" />
        </div>
        <div className="h-6 w-14  rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3  rounded w-full" />
        <div className="h-3  rounded w-4/5" />
      </div>
    </div>
  );
}


export default function RoomDetailReview({ hotelId, hotelName }) {
  const [reviews,  setReviews]  = useState([]);
  const [rating,   setRating]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');


  const [filterStar, setFilterStar] = useState(0);
  const [sort,       setSort]       = useState('newest');

  const sectionRef = useRef(null);


  useEffect(() => {
    if (!hotelId) return;
    setLoading(true);
    setError('');

    Promise.all([
      reviewApi.getHotelReviews(hotelId),
      reviewApi.getHotelRating(hotelId),
    ])
      .then(([rRes, ratRes]) => {
        setReviews(rRes.data ?? []);
        setRating(ratRes.data ?? null);
      })
      .catch(() => setError('Không tải được đánh giá. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [hotelId]);


  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));


  const processed = reviews
    .filter(r => filterStar === 0 || r.rating === filterStar)
    .sort((a, b) => {
      if (sort === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest')  return a.rating - b.rating;
      return 0;
    });


  const avg     = rating?.averageRating ?? 0;
  const total   = rating?.totalReviews  ?? reviews.length;
  const avgDisp = avg > 0 ? Number(avg).toFixed(1) : '—';

  const sentimentLabel =
    avg >= 4.5 ? 'Xuất sắc' :
    avg >= 4.0 ? 'Rất tốt'  :
    avg >= 3.5 ? 'Tốt'      :
    avg >= 3.0 ? 'Khá'      :
    avg > 0    ? 'Trung bình' : '';

  return (
    <section ref={sectionRef} className="border border-zinc-800 rounded-2xl overflow-hidden">

      {/*Section header*/}
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            Đánh giá từ khách hàng
          </h2>
          {hotelName && (
            <p className="text-xs mt-0.5">{hotelName}</p>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={avg} size="sm" />
            <span className="text-xs ">{total} đánh giá</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          /*Loading state*/
          <div className="space-y-4">
            <div className="flex gap-6 mb-6">
              <div className="w-28 h-24 rounded-2xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2.5 py-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-2 rounded animate-pulse" style={{ width: `${60 + i * 6}%` }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : error ? (
          /* Error state*/
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <span className="text-3xl opacity-30"><CircleX /></span>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => { setLoading(true); reviewApi.getHotelReviews(hotelId).then(r => { setReviews(r.data); setError(''); }).catch(() => setError('Thử lại thất bại.')).finally(() => setLoading(false)); }}
              className="text-xs text-yellow-600 hover:text-yellow-400 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : reviews.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-14 gap-4 text-center">
            <div className="relative">
              <span className="text-5xl opacity-20"><Star /></span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center">
                <span className="text-[10px]">0</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Chưa có đánh giá nào</p>
              <p className="text-xs max-w-xs">
                Hãy là người đầu tiên chia sẻ trải nghiệm tại {hotelName ?? 'khách sạn này'}.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/*Summary section*/}
            <div className="flex flex-col sm:flex-row gap-6 mb-7">

              {/* Big score */}
              <div className="flex flex-col items-center justify-center w-full sm:w-36 flex-shrink-0 py-4 border border-zinc-700/40 rounded-2xl">
                <span className="font-display text-5xl font-semibold leading-none mb-1">
                  {avgDisp}
                </span>
                <Stars value={avg} size="md" />
                {sentimentLabel && (
                  <span className="mt-2 text-xs font-medium text-yellow-400 tracking-wide">
                    {sentimentLabel}
                  </span>
                )}
                <span className="text-[11px] mt-1">{total} lượt</span>
              </div>

              {/* Distribution bars */}
              <div className="flex-1 flex flex-col justify-center gap-2.5">
                {dist.map(({ star, count }) => (
                  <RatingBar
                    key={star}
                    star={star}
                    count={count}
                    total={total}
                    active={filterStar === star || filterStar === 0}
                    onClick={() => setFilterStar(prev => prev === star ? 0 : star)}
                  />
                ))}
              </div>
            </div>

            {/*Filter + Sort bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Star filter chips */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilterStar(0)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    filterStar === 0
                      ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                      : 'border-zinc-700 hover:border-zinc-500 '
                  }`}
                >
                  Tất cả ({total})
                </button>
                {dist.filter(d => d.count > 0).map(({ star, count }) => (
                  <button
                    key={star}
                    onClick={() => setFilterStar(prev => prev === star ? 0 : star)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      filterStar === star
                        ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                        : 'border-zinc-700 hover:border-zinc-500 '
                    }`}
                  >
                    <span className="text-yellow-400"><Star /></span> {star}
                    <span >({count})</span>
                  </button>
                ))}
              </div>

              {/* Sort select */}
              <div className="ml-auto">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className=" border border-zinc-700 text-zinc-950 text-xs rounded-lg px-3 py-2 outline-none focus:border-yellow-600/60 transition-colors cursor-pointer appearance-none"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="highest">Điểm cao nhất</option>
                  <option value="lowest">Điểm thấp nhất</option>
                </select>
              </div>
            </div>

            {/* Review grid */}
            {processed.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm">
                  Không có đánh giá {filterStar} sao nào.
                </p>
                <button
                  onClick={() => setFilterStar(0)}
                  className="mt-2 text-xs text-yellow-600 hover:text-yellow-400 transition-colors"
                >
                  Xem tất cả
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {processed.map((review, i) => (
                  <ReviewCard key={review.id} review={review} index={i} />
                ))}
              </div>
            )}

            {/* Count summary */}
            <p className="text-center text-xs mt-6">
              Hiển thị {processed.length} / {total} đánh giá
              {filterStar > 0 && ` (lọc ${filterStar} sao)`}
            </p>
          </>
        )}
      </div>
    </section>
  );
}