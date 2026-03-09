import { STATUS_LABELS } from "@/constants/roomStatus";
import "./RoomStatusFilter.css";

export default function RoomStatusFilter({ value, onChange }) {
  return (
    <div className="room-status-filter">
      <label>Lọc trạng thái: </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Tất cả</option>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
  );
}
