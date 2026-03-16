import { STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITIONS } from "@/constants/roomStatus";

export default function RoomCard({ room, onStatusChange, onDelete }) {
  const transitions = STATUS_TRANSITIONS[room.status] || [];

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-3.5 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex justify-between items-center">
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
          Phòng {room.roomNumber}
        </span>
        <span className="text-xs text-slate-400 font-medium">#{room.id}</span>
      </div>

      <span
        className="inline-flex items-center px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide self-start"
        style={{ backgroundColor: STATUS_COLORS[room.status] }}
      >
        {STATUS_LABELS[room.status]}
      </span>

      <div className="flex flex-col gap-1.5 text-sm bg-slate-50 rounded-lg px-3.5 py-3">
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Khách sạn:</span>
          <span className="font-semibold text-slate-800">{room.hotelId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Loại phòng:</span>
          <span className="font-semibold text-slate-800">{room.roomTypeId}</span>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3.5">
          <span className="text-[11px] text-slate-400 mb-0.5 font-semibold uppercase tracking-wide">
            Chuyển trạng thái:
          </span>
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              className="px-3.5 py-1.5 bg-white border-2 border-solid rounded-lg cursor-pointer text-sm font-semibold transition-all hover:opacity-85 hover:-translate-y-px hover:shadow-md"
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
          className="px-3.5 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 cursor-pointer text-xs font-semibold mt-1 transition-all hover:bg-red-600 hover:border-red-600 hover:text-white hover:shadow-md hover:shadow-red-600/25"
          onClick={() => onDelete(room.id)}
        >
          Xóa phòng
        </button>
      )}
    </div>
  );
}
