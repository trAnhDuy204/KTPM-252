import { STATUS_LABELS, STATUS_COLORS } from "@/constants/roomStatus";

export default function RoomStatusSummary({ rooms }) {
  const counts = {};
  for (const status of Object.keys(STATUS_LABELS)) {
    counts[status] = rooms.filter((r) => r.status === status).length;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="bg-slate-900 rounded-2xl px-4 py-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/20 hover:scale-[1.02]">
        <span className="block text-3xl font-extrabold leading-tight text-white">
          {rooms.length}
        </span>
        <span className="block text-[11px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
          Tổng phòng
        </span>
      </div>
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <div
          key={status}
          className="bg-white border border-slate-200/80 rounded-2xl px-4 py-4 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-slate-300"
        >
          <span
            className="block text-3xl font-extrabold leading-tight"
            style={{ color: STATUS_COLORS[status] }}
          >
            {counts[status]}
          </span>
          <span className="block text-[11px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
