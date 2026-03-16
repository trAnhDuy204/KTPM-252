import { STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITIONS } from "@/constants/roomStatus";

export default function RoomCard({ room, onStatusChange, onDelete }) {
  const transitions = STATUS_TRANSITIONS[room.status] || [];

  return (
    <div className="group border border-slate-200/80 rounded-2xl p-5 bg-white flex flex-col gap-3.5 transition-all duration-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phòng {room.roomNumber}
          </span>
          <span
            className="ml-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: STATUS_COLORS[room.status] }}
          >
            {STATUS_LABELS[room.status]}
          </span>
        </div>
        <span className="text-xs text-slate-300 font-mono">#{room.id}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm bg-slate-50/80 rounded-xl px-3.5 py-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Khách sạn</span>
          <span className="font-semibold text-slate-700">{room.hotelId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Loại phòng</span>
          <span className="font-semibold text-slate-700">{room.roomTypeId}</span>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              className="px-3 py-1.5 bg-white border rounded-lg cursor-pointer text-xs font-semibold transition-all duration-150 hover:scale-105 hover:shadow-md active:scale-95"
              style={{
                borderColor: STATUS_COLORS[nextStatus] + "60",
                color: STATUS_COLORS[nextStatus],
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = STATUS_COLORS[nextStatus];
                e.target.style.color = "white";
                e.target.style.borderColor = STATUS_COLORS[nextStatus];
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = STATUS_COLORS[nextStatus];
                e.target.style.borderColor = STATUS_COLORS[nextStatus] + "60";
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
          className="w-full mt-auto px-3 py-1.5 bg-transparent border border-red-200 rounded-lg text-red-400 cursor-pointer text-xs font-medium transition-all duration-150 hover:bg-red-50 hover:text-red-600 hover:border-red-300 active:scale-[0.98]"
          onClick={() => onDelete(room.id)}
        >
          Xóa phòng
        </button>
      )}
    </div>
  );
}
