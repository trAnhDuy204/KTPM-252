import { STATUS_LABELS, STATUS_COLORS } from "@/constants/roomStatus";

export default function RoomStatusSummary({ rooms }) {
  const counts = {};
  for (const status of Object.keys(STATUS_LABELS)) {
    counts[status] = rooms.filter((r) => r.status === status).length;
  }

  return (
    <div className="flex gap-3 mb-5 flex-wrap">
      <div className="flex-1 min-w-30 bg-slate-900 border border-slate-900 rounded-xl px-5 py-4 text-center transition-shadow hover:shadow-md">
        <span className="block text-3xl font-extrabold leading-tight text-white">
          {rooms.length}
        </span>
        <span className="block text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
          Tổng phòng
        </span>
      </div>
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <div
          key={status}
          className="flex-1 min-w-30 bg-white border border-slate-200 rounded-xl px-5 py-4 text-center transition-shadow hover:shadow-md"
        >
          <span
            className="block text-3xl font-extrabold leading-tight"
            style={{ color: STATUS_COLORS[status] }}
          >
            {counts[status]}
          </span>
          <span className="block text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
