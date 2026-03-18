import { useEffect, useState } from "react";
import { getBookings, checkIn, checkOut, cancelBooking, createBooking, confirmBooking } from "@/services/bookingApi";
import BookingCard from "@/components/booking/BookingCard";
import BookingStatusFilter from "@/components/booking/BookingStatusFilter";
import CheckInForm from "@/components/booking/CheckInForm";
import CreateBookingForm from "@/components/booking/CreateBookingForm";

export default function CheckInOut() {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);

  const showError = (err) => {
    const data = err.response?.data;
    let msg = data?.message || err.message || "Đã có lỗi xảy ra";
    if (data?.validationErrors) {
      const details = Object.values(data.validationErrors).join(", ");
      msg = `${msg}: ${details}`;
    }
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBookings(null, filterStatus || undefined);
      setBookings(res.data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleCheckIn = async (formData) => {
    try {
      await checkIn(formData);
      setShowCheckIn(false);
      fetchBookings();
    } catch (err) {
      showError(err);
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (!window.confirm("Xác nhận check-out?")) return;
    try {
      await checkOut(bookingId);
      fetchBookings();
    } catch (err) {
      showError(err);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Xác nhận hủy booking này?")) return;
    try {
      await cancelBooking(bookingId);
      fetchBookings();
    } catch (err) {
      showError(err);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await confirmBooking(bookingId);
      fetchBookings();
    } catch (err) {
      showError(err);
    }
  };

  const handleCreateBooking = async (formData) => {
    try {
      await createBooking(formData);
      setShowCreateBooking(false);
      fetchBookings();
    } catch (err) {
      showError(err);
    }
  };

  const checkedInCount = bookings.filter((b) => b.status === "CHECKED_IN").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-zinc-100 mb-1">
            Check-in / Check-out
          </h1>
          <p className="text-zinc-500 text-sm">Quản lý nhận &amp; trả phòng</p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm active:scale-95 transition-all duration-200 cursor-pointer"
            onClick={() => { setShowCreateBooking(!showCreateBooking); setShowCheckIn(false); }}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: showCreateBooking ? "rotate(45deg)" : "none" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {showCreateBooking ? "Đóng" : "Đặt phòng trước"}
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm active:scale-95 transition-all duration-200 cursor-pointer"
            onClick={() => { setShowCheckIn(!showCheckIn); setShowCreateBooking(false); }}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: showCheckIn ? "rotate(45deg)" : "none" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {showCheckIn ? "Đóng" : "Check-in mới"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center justify-between bg-red-500/10 text-red-400 px-4 py-3 rounded-lg border border-red-500/25 text-sm">
            <span className="font-medium">{error}</span>
            <button
              className="ml-3 text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none text-lg font-bold"
              onClick={() => setError("")}
            >&times;</button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-center transition-all duration-200 hover:border-zinc-700 hover:scale-[1.02]">
            <span className="block text-3xl font-extrabold leading-tight text-zinc-100">
              {bookings.length}
            </span>
            <span className="block text-[11px] font-semibold text-zinc-500 mt-1.5 uppercase tracking-wider">
              Tổng booking
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-center transition-all duration-200 hover:border-zinc-700 hover:scale-[1.02]">
            <span className="block text-3xl font-extrabold leading-tight text-emerald-400">
              {checkedInCount}
            </span>
            <span className="block text-[11px] font-semibold text-zinc-500 mt-1.5 uppercase tracking-wider">
              Đang ở
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-center transition-all duration-200 hover:border-zinc-700 hover:scale-[1.02]">
            <span className="block text-3xl font-extrabold leading-tight text-zinc-400">
              {completedCount}
            </span>
            <span className="block text-[11px] font-semibold text-zinc-500 mt-1.5 uppercase tracking-wider">
              Đã trả
            </span>
          </div>
        </div>

        {/* Filter */}
        <BookingStatusFilter value={filterStatus} onChange={setFilterStatus} />

        {/* Create Booking Form */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{
            gridTemplateRows: showCreateBooking ? "1fr" : "0fr",
            opacity: showCreateBooking ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            <CreateBookingForm
              onSubmit={handleCreateBooking}
              onCancel={() => setShowCreateBooking(false)}
            />
          </div>
        </div>

        {/* Check-in Form */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{
            gridTemplateRows: showCheckIn ? "1fr" : "0fr",
            opacity: showCheckIn ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            <CheckInForm
              onSubmit={handleCheckIn}
              onCancel={() => setShowCheckIn(false)}
            />
          </div>
        </div>

        {/* Booking Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
            <span className="ml-3 text-zinc-400 text-sm">Đang tải...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-zinc-300 font-medium">Chưa có booking nào</p>
            <p className="text-zinc-500 text-sm mt-1">Bấm "Check-in mới" để bắt đầu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <BookingCard
                  booking={booking}
                  onCheckOut={handleCheckOut}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
