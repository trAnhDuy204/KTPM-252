import { useEffect, useState } from "react";
import { Plus, ReceiptText, X } from "lucide-react";
import {
  cancelBooking,
  checkIn,
  checkOut,
  confirmBooking,
  createBooking,
  getBookings,
} from "@/services/bookingApi";
import { useAuth } from "@/context/AuthContext";
import BookingStatusFilter from "@/components/booking/BookingStatusFilter";
import BookingTable from "@/components/booking/BookingTable";
import CheckInForm from "@/components/booking/CheckInForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import CreateBookingForm from "@/components/booking/CreateBookingForm";
import {
  btnAccent,
  btnSoftSuccess,
  errorBanner,
  pageSubtitle,
  pageTitle,
  statCard,
  statLabel,
} from "@/utils/cls";

function SummaryCard({ label, value, valueClass = "text-hi", accent = false }) {
  return (
    <div className={`${statCard} ${accent ? "bg-accent-soft/55" : ""} text-center`}>
      <span className={`block text-3xl font-semibold leading-tight ${valueClass}`}>
        {value}
      </span>
      <span className={statLabel}>{label}</span>
    </div>
  );
}

export default function CheckInOut() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [dialog, setDialog] = useState(null);

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
    if (!user?.hotelId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getBookings(user.hotelId, filterStatus || undefined);
      setBookings(res.data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, user?.hotelId]);

  const handleCheckIn = async (formData) => {
    try {
      await checkIn(formData);
      setShowCheckIn(false);
      fetchBookings();
    } catch (err) {
      showError(err);
    }
  };

  const handleCheckOut = (bookingId) => {
    setDialog({
      title: "Check-out",
      message: "Xác nhận trả phòng cho booking này?",
      variant: "warning",
      onConfirm: async () => {
        setDialog(null);
        try {
          await checkOut(bookingId);
          fetchBookings();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const handleCancel = (bookingId) => {
    setDialog({
      title: "Hủy booking",
      message: "Bạn có chắc muốn hủy booking này? Hành động không thể hoàn tác.",
      variant: "danger",
      onConfirm: async () => {
        setDialog(null);
        try {
          await cancelBooking(bookingId);
          fetchBookings();
        } catch (err) {
          showError(err);
        }
      },
    });
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
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className={pageTitle}>Check-in / Check-out</h1>
          <p className={`${pageSubtitle} mt-1`}>
            Quản lý nhận và trả phòng với màu hành động đồng bộ hơn ở khu lễ tân.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className={btnAccent}
            onClick={() => {
              setShowCreateBooking(!showCreateBooking);
              setShowCheckIn(false);
            }}
          >
            <Plus
              className="h-4 w-4 transition-transform duration-200"
              style={{ transform: showCreateBooking ? "rotate(45deg)" : "none" }}
            />
            {showCreateBooking ? "Đóng đặt phòng" : "Đặt phòng trước"}
          </button>
          <button
            className={btnSoftSuccess}
            onClick={() => {
              setShowCheckIn(!showCheckIn);
              setShowCreateBooking(false);
            }}
          >
            <Plus
              className="h-4 w-4 transition-transform duration-200"
              style={{ transform: showCheckIn ? "rotate(45deg)" : "none" }}
            />
            {showCheckIn ? "Đóng check-in" : "Check-in mới"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {error && (
          <div className={`${errorBanner} flex items-center justify-between gap-3`}>
            <span className="font-medium">{error}</span>
            <button
              className="text-danger transition-colors hover:text-danger/80"
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Tổng booking" value={bookings.length} accent />
          <SummaryCard label="Đang ở" value={checkedInCount} valueClass="text-success" />
          <SummaryCard label="Đã trả" value={completedCount} valueClass="text-warning" />
        </div>

        <BookingStatusFilter value={filterStatus} onChange={setFilterStatus} />

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-[3px] border-accent/25 border-t-accent animate-spin" />
            <span className="ml-3 text-sm text-muted">Đang tải dữ liệu booking...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-edge bg-card px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-raised text-ghost">
              <ReceiptText className="h-8 w-8" />
            </div>
            <p className="font-semibold text-dim">Chưa có booking nào</p>
            <p className="mt-1 text-sm text-muted">Bấm "Check-in mới" để bắt đầu.</p>
          </div>
        ) : (
          <BookingTable
            bookings={bookings}
            onCheckOut={handleCheckOut}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        )}
      </div>

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        variant={dialog?.variant}
        onConfirm={dialog?.onConfirm}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}
