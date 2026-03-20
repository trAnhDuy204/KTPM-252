import { STATUS_LABELS, STATUS_COLORS } from "@/constants/roomStatus";
import { statCard, statLabel } from "@/utils/cls";

export default function RoomStatusSummary({ rooms }) {
  const counts = {};
  for (const status of Object.keys(STATUS_LABELS)) {
    counts[status] = rooms.filter((r) => r.status === status).length;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <div className={`${statCard} bg-accent-soft/55 text-center`}>
        <span className="block text-3xl font-semibold leading-tight text-hi">
          {rooms.length}
        </span>
        <span className={`${statLabel} text-dim`}>Tổng phòng</span>
      </div>

      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <div key={status} className={`${statCard} text-center`}>
          <span
            className="block text-3xl font-semibold leading-tight"
            style={{ color: STATUS_COLORS[status] }}
          >
            {counts[status]}
          </span>
          <span className={statLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}
