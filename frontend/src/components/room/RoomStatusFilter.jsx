import { STATUS_LABELS, STATUS_COLORS } from "@/constants/roomStatus";

export default function RoomStatusFilter({ value, onChange }) {
  const options = [
    { key: "", label: "Tất cả" },
    ...Object.entries(STATUS_LABELS).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map(({ key, label }) => {
        const isActive = value === key;
        const color = STATUS_COLORS[key];

        return (
          <button
            key={key}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer
              ${isActive
                ? "text-white shadow-md scale-[1.02]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            style={
              isActive
                ? {
                    backgroundColor: color || "#334155",
                    borderColor: color || "#334155",
                  }
                : undefined
            }
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
