import React, { useState } from 'react';
import { Star } from 'lucide-react';
const SIZE = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' };

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
}) {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`${SIZE[size] || SIZE.md} transition-all duration-100 leading-none
            ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
            ${star <= active ? 'text-yellow-400' : 'text-zinc-700'}`}
        >
            <Star />
        </button>
      ))}

      {/* Numeric label khi read-only */}
      {readOnly && value > 0 && (
        <span className="ml-1.5 text-xs font-medium text-zinc-400 tabular-nums">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
}