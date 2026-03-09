import { STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITIONS } from "@/constants/roomStatus";
import "./RoomCard.css";

export default function RoomCard({ room, onStatusChange, onDelete }) {
  const transitions = STATUS_TRANSITIONS[room.status] || [];

  return (
    <div className="room-card">
      <div className="room-header">
        <span className="room-number">Phòng {room.roomNumber}</span>
        <span className="room-id">#{room.id}</span>
      </div>

      <div
        className="room-status-badge"
        style={{ backgroundColor: STATUS_COLORS[room.status] }}
      >
        {STATUS_LABELS[room.status]}
      </div>

      <div className="room-info">
        <div className="info-row">
          <span className="info-label">Khách sạn:</span>
          <span className="info-value">{room.hotelId}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Loại phòng:</span>
          <span className="info-value">{room.roomTypeId}</span>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="room-actions">
          <span className="actions-label">Chuyển trạng thái:</span>
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              className="btn-status"
              style={{
                borderColor: STATUS_COLORS[nextStatus],
                color: STATUS_COLORS[nextStatus],
              }}
              onClick={() => onStatusChange(room.id, nextStatus)}
            >
              {STATUS_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      )}

      {room.status !== "OCCUPIED" && (
        <button
          className="btn-delete"
          onClick={() => onDelete(room.id)}
        >
          Xóa phòng
        </button>
      )}
    </div>
  );
}
