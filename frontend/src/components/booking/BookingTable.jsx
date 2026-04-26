import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/constants/bookingStatus";
import { panelCard } from "@/utils/cls";

export default function BookingTable({ bookings, onCheckIn, onCheckOut, onCancel, onConfirm }) {
  if (bookings.length === 0) return null;

  return (
    <div className={`${panelCard} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-sm">
          <thead>
            <tr className="bg-raised/85 text-xs uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Phòng</th>
              <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold">SĐT</th>
              <th className="px-4 py-3 text-left font-semibold">Check-in</th>
              <th className="px-4 py-3 text-left font-semibold">Check-out</th>
              <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
              <th className="px-4 py-3 text-center font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING";
              const isCheckedIn = booking.status === "CHECKED_IN";
              const isConfirmed = booking.status === "CONFIRMED";
              const canCancel =
                isPending || isConfirmed;

              return (
                <tr
                  key={booking.id}
                  className="bg-card transition-colors hover:bg-raised/45"
                >
                  <td className="px-4 py-3 text-xs font-mono text-muted">{booking.id}</td>
                  <td className="px-4 py-3 font-semibold text-hi">
                    Phòng {booking.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-dim">{booking.guestName}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted">
                    {booking.guestPhone || "—"}
                  </td>
                  <td className="px-4 py-3 text-dim">{booking.checkIn}</td>
                  <td className="px-4 py-3 text-dim">{booking.checkOut}</td>
                  <td className="px-4 py-3 text-right font-semibold text-accent">
                    {booking.totalPrice
                      ? `${Number(booking.totalPrice).toLocaleString()}đ`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                      style={{ backgroundColor: BOOKING_STATUS_COLORS[booking.status] }}
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {isPending && onConfirm && (
                        <button
                          className="rounded-lg border border-info/20 bg-info-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-info transition-all duration-200 hover:border-info hover:bg-info hover:text-white"
                          onClick={() => onConfirm(booking.id)}
                        >
                          Xác nhận
                        </button>
                      )}
                      {isConfirmed && (
                        <button
                          className="rounded-lg border border-warning/20 bg-warning-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-warning transition-all duration-200 hover:border-warning hover:bg-warning hover:text-white"
                          onClick={() => onCheckIn(booking.id)}
                        >
                          Check-in
                        </button>
                      )}
                      {isCheckedIn && (
                        <button
                          className="rounded-lg border border-success/20 bg-success-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-success transition-all duration-200 hover:border-success hover:bg-success hover:text-white"
                          onClick={() => onCheckOut(booking.id)}
                        >
                          Check-out
                        </button>
                      )}
                      {canCancel && (
                        <button
                          className="rounded-lg border border-danger/20 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-danger transition-all duration-200 hover:bg-danger-soft/35 hover:border-danger/35"
                          onClick={() => onCancel(booking.id)}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
