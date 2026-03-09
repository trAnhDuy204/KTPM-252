import { STATUS_LABELS, STATUS_COLORS } from "@/constants/roomStatus";
import "./RoomStatusSummary.css";

export default function RoomStatusSummary({ rooms }) {
  const counts = {};
  for (const status of Object.keys(STATUS_LABELS)) {
    counts[status] = rooms.filter((r) => r.status === status).length;
  }

  return (
    <div className="status-summary">
      <div className="summary-item summary-total">
        <span className="summary-count">{rooms.length}</span>
        <span className="summary-label">Tổng phòng</span>
      </div>
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <div key={status} className="summary-item">
          <span
            className="summary-count"
            style={{ color: STATUS_COLORS[status] }}
          >
            {counts[status]}
          </span>
          <span className="summary-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
