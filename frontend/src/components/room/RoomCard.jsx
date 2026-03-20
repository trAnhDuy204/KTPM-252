import { STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITIONS } from "@/constants/roomStatus";
import { btnGhostDanger, panelCard, panelRaised } from "@/utils/cls";

export default function RoomCard({ room, onStatusChange, onDelete }) {
  const transitions = STATUS_TRANSITIONS[room.status] || [];
  const roomTypeValue = room.roomTypeName || room.roomTypeId || "—";

  return (
    <div
      className={`${panelCard} flex h-full flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-edge-md hover:shadow-lg hover:shadow-black/[0.08]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-hi">
              Phòng {room.roomNumber}
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
              style={{ backgroundColor: STATUS_COLORS[room.status] }}
            >
              {STATUS_LABELS[room.status]}
            </span>
          </div>
          <p className="mt-2 text-xs font-mono text-ghost">#{room.id}</p>
        </div>
      </div>

      <div className={`${panelRaised} flex flex-col gap-2 px-4 py-3 text-sm`}>
        {room.hotelId !== undefined && room.hotelId !== null && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted">Khách sạn</span>
            <span className="font-semibold text-dim">{room.hotelId}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Loại phòng</span>
          <span className="font-semibold text-dim">{roomTypeValue}</span>
        </div>
        {room.roomTypeCapacity !== undefined && room.roomTypeCapacity !== null && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted">Sức chứa</span>
            <span className="font-semibold text-dim">{room.roomTypeCapacity} người</span>
          </div>
        )}
      </div>

      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => onStatusChange(room.id, nextStatus)}
              className="rounded-lg border border-edge bg-raised px-3 py-2 text-xs font-semibold text-dim transition-all duration-200 hover:border-edge-md hover:bg-raised-2 hover:text-hi"
            >
              {STATUS_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      )}

      {room.status !== "OCCUPIED" && onDelete && (
        <button
          className={`${btnGhostDanger} mt-auto w-full`}
          onClick={() => onDelete(room.id)}
        >
          Xóa phòng
        </button>
      )}
    </div>
  );
}
