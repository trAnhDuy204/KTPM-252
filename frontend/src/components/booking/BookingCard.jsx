import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/constants/bookingStatus";

export default function BookingCard({ booking, onCheckOut, onCancel, onConfirm }) {
  const isCheckedIn = booking.status === "CHECKED_IN";
  const isPending = booking.status === "PENDING";
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED" || booking.status === "CHECKED_IN";

  return (
    <div className="border border-zinc-700/50 rounded-2xl p-5 bg-zinc-900 flex flex-col gap-3.5 transition-all duration-200 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 hover:border-zinc-600">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-extrabold text-zinc-100 tracking-tight">
            Phòng {booking.roomNumber}
          </span>
          <span
            className="ml-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: BOOKING_STATUS_COLORS[booking.status] }}
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
        <span className="text-xs text-zinc-600 font-mono">#{booking.id}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm bg-zinc-800/50 rounded-xl px-3.5 py-3">
        <div className="flex justify-between">
          <span className="text-zinc-500">Khách</span>
          <span className="font-semibold text-zinc-300">{booking.guestName}</span>
        </div>
        {booking.guestPhone && (
          <div className="flex justify-between">
            <span className="text-zinc-500">SĐT</span>
            <span className="font-semibold text-zinc-300">{booking.guestPhone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">Check-in</span>
          <span className="font-semibold text-zinc-300">{booking.checkIn}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Check-out</span>
          <span className="font-semibold text-zinc-300">{booking.checkOut}</span>
        </div>
        {booking.totalPrice && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Tổng tiền</span>
            <span className="font-bold text-emerald-400">
              {Number(booking.totalPrice).toLocaleString()}đ
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        {isPending && onConfirm && (
          <button
            className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg cursor-pointer text-xs font-semibold transition-all duration-150 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95"
            onClick={() => onConfirm(booking.id)}
          >
            Xác nhận
          </button>
        )}
        {isCheckedIn && (
          <button
            className="flex-1 px-3 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg cursor-pointer text-xs font-semibold transition-all duration-150 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95"
            onClick={() => onCheckOut(booking.id)}
          >
            Check-out
          </button>
        )}
        {canCancel && (
          <button
            className="flex-1 px-3 py-2 bg-transparent border border-red-500/20 rounded-lg text-red-400 cursor-pointer text-xs font-medium transition-all duration-150 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95"
            onClick={() => onCancel(booking.id)}
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}
