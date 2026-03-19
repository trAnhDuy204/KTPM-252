import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITIONS } from "@/constants/roomStatus";

function StatusDropdown({ transitions, onSelect }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
      >
        <span>Chuyển trạng thái</span>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl shadow-black/60 overflow-hidden z-[9999]"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => { onSelect(nextStatus); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-left hover:bg-zinc-700/60 transition-colors cursor-pointer"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[nextStatus] }}
              />
              <span className="text-zinc-200">{STATUS_LABELS[nextStatus]}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default function RoomCard({ room, onStatusChange, onDelete }) {
  const transitions = STATUS_TRANSITIONS[room.status] || [];

  return (
    <div className="border border-zinc-700/50 rounded-2xl p-5 bg-zinc-900 flex flex-col gap-3.5 transition-all duration-200 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 hover:border-zinc-600">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-extrabold text-zinc-100 tracking-tight">
            Phòng {room.roomNumber}
          </span>
          <span
            className="ml-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: STATUS_COLORS[room.status] }}
          >
            {STATUS_LABELS[room.status]}
          </span>
        </div>
        <span className="text-xs text-zinc-600 font-mono">#{room.id}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm bg-zinc-800/50 rounded-xl px-3.5 py-3">
        <div className="flex justify-between">
          <span className="text-zinc-500">Loại phòng</span>
          <span className="font-semibold text-zinc-300">{room.roomTypeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Sức chứa</span>
          <span className="font-semibold text-zinc-300">{room.roomTypeCapacity} người</span>
        </div>
      </div>

      {transitions.length > 0 && (
        <StatusDropdown
          transitions={transitions}
          onSelect={(nextStatus) => onStatusChange(room.id, nextStatus)}
        />
      )}

      {room.status !== "OCCUPIED" && (
        <button
          className="w-full mt-auto px-3 py-1.5 bg-transparent border border-red-500/20 rounded-lg text-red-400 cursor-pointer text-xs font-medium transition-all duration-150 hover:bg-red-500/10 hover:border-red-500/40 active:scale-[0.98]"
          onClick={() => onDelete(room.id)}
        >
          Xóa phòng
        </button>
      )}
    </div>
  );
}
