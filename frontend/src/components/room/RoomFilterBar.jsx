import { useMemo } from "react";
import { Search, X } from "lucide-react";
import {
  btnSecondary,
  inputBase,
  panelRaised,
} from "@/utils/cls";

const selectClass = (active) =>
  `${inputBase} min-w-[140px] appearance-none py-2 text-xs ${
    active ? "border-accent" : ""
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
    <div className={`${panelRaised} flex flex-wrap items-center gap-3 p-3`}>
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Tìm số phòng..."
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className={`${inputBase} py-2 pl-9 text-xs`}
        />
      </div>

      {roomTypes.length > 0 && (
        <select
          className={selectClass(!!filters.type)}
          value={filters.type}
          onChange={(e) => onChange("type", e.target.value)}
        >
          <option value="">Loại phòng</option>
          {roomTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      {floors.length > 0 && (
        <select
          className={selectClass(!!filters.floor)}
          value={filters.floor}
          onChange={(e) => onChange("floor", e.target.value)}
        >
          <option value="">Tầng</option>
          {floors.map((f) => (
            <option key={f} value={f}>
              Tầng {f}
            </option>
          ))}
        </select>
      )}

      {hasActiveFilter && (
        <button
          onClick={() => onChange("reset")}
          className={`${btnSecondary} px-4 py-2 text-xs`}
        >
          <X className="h-3.5 w-3.5" />
          Xóa lọc
        </button>
      )}
    </div>
  );
}
