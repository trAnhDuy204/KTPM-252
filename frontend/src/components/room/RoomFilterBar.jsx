import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { STATUS_LABELS } from "@/constants/roomStatus";

const selectClass = (active) =>
  `px-3 py-2 rounded-lg text-xs border outline-none cursor-pointer transition-colors bg-zinc-800 ${
    active
      ? "border-yellow-600/70 text-zinc-100"
      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
  }`;

export default function RoomFilterBar({ filters, onChange, rooms }) {
  const roomTypes = useMemo(() => {
    const seen = new Set();
    return rooms
      .map((r) => r.roomTypeName)
      .filter((t) => t && !seen.has(t) && seen.add(t));
  }, [rooms]);

  const floors = useMemo(() => {
    const seen = new Set();
    return rooms
      .map((r) => String(Math.floor(parseInt(r.roomNumber) / 100)))
      .filter((f) => !isNaN(f) && Number(f) > 0 && !seen.has(f) && seen.add(f))
      .sort((a, b) => a - b);
  }, [rooms]);

  const hasActiveFilter =
    filters.status || filters.type || filters.floor || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm số phòng..."
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className="pl-8 pr-3 py-2 w-40 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* Status */}
      <select
        className={selectClass(!!filters.status)}
        value={filters.status}
        onChange={(e) => onChange("status", e.target.value)}
      >
        <option value="">Trạng thái</option>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {/* Room type */}
      {roomTypes.length > 0 && (
        <select
          className={selectClass(!!filters.type)}
          value={filters.type}
          onChange={(e) => onChange("type", e.target.value)}
        >
          <option value="">Loại phòng</option>
          {roomTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}

      {/* Floor */}
      {floors.length > 0 && (
        <select
          className={selectClass(!!filters.floor)}
          value={filters.floor}
          onChange={(e) => onChange("floor", e.target.value)}
        >
          <option value="">Tầng</option>
          {floors.map((f) => (
            <option key={f} value={f}>Tầng {f}</option>
          ))}
        </select>
      )}

      {/* Reset */}
      {hasActiveFilter && (
        <button
          onClick={() => onChange("reset")}
          className="inline-flex items-center gap-1 px-3 py-2 text-xs text-zinc-400 border border-zinc-700 rounded-lg bg-zinc-800 hover:text-zinc-200 hover:border-zinc-500 transition-all cursor-pointer"
        >
          <X className="w-3 h-3" /> Xóa lọc
        </button>
      )}
    </div>
  );
}
