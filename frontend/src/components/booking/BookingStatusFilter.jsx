import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/constants/bookingStatus";

export default function BookingStatusFilter({ value, onChange }) {
  const options = [
    { key: "", label: "Tất cả" },
    ...Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map(({ key, label }) => {
        const isActive = value === key;
        const color = BOOKING_STATUS_COLORS[key];

        return (
          <button
            key={key}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "scale-[1.02] text-white shadow-md"
                : "border-edge bg-raised text-muted hover:border-edge-md hover:bg-raised-2 hover:text-hi"
            }`}
            style={
              isActive
                ? { backgroundColor: color || "#8a8694", borderColor: color || "#8a8694" }
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
