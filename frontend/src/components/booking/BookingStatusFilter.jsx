import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/constants/bookingStatus";

export default function BookingStatusFilter({ value, onChange }) {
  const options = [
    { key: "", label: "Tất cả" },
    ...Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map(({ key, label }) => {
        const isActive = value === key;
        const color = BOOKING_STATUS_COLORS[key];

        return (
          <button
            key={key}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer
              ${isActive
                ? "text-white shadow-md scale-[1.02]"
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            style={
              isActive
                ? { backgroundColor: color || "#52525b", borderColor: color || "#52525b" }
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
