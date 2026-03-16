import { STATUS_LABELS } from "@/constants/roomStatus";

export default function RoomStatusFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-600">Lọc trạng thái:</label>
      <select
        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium cursor-pointer outline-none transition-all min-w-45 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-slate-300 appearance-none bg-no-repeat bg-position-[right_12px_center] pr-9"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Tất cả</option>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
  );
}
