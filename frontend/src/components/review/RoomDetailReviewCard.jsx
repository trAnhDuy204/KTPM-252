import React, { useState} from 'react';
import { Star } from 'lucide-react';

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

export default function RoomDetailReviewCard({ review, index }) {
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