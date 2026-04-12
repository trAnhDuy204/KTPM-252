import { STATUS_LABELS, STATUS_COLORS } from "@/constants/roomStatus";

export default function RoomStatusFilter({ value, onChange }) {
  const options = [
    { key: "", label: "Tất cả" },
    ...Object.entries(STATUS_LABELS).map(([key, label]) => ({ key, label })),
  ];

  const activeColor = STATUS_COLORS[value] || "#8d8378";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-edge bg-raised px-4 py-2 text-sm font-medium text-hi outline-none transition-colors hover:border-edge-md focus:ring-2"
      style={value ? { borderColor: activeColor, color: activeColor } : undefined}
    >
      {options.map(({ key, label }) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
