import { useState, useEffect } from "react";
import { AlertCircle, Check } from "lucide-react";
import { getRooms } from "@/services/roomApi";
import { useAuth } from "@/context/AuthContext";
import {
  btnAccent,
  btnSecondary,
  formPanel,
  inputBase,
  inputError,
  label,
  sectionHeading,
} from "@/utils/cls";

const validate = (data) => {
  const errors = {};
  if (!data.roomId) errors.roomId = "Vui lòng chọn phòng";
  if (!data.checkIn) errors.checkIn = "Vui lòng chọn ngày nhận phòng";
  if (!data.checkOut) errors.checkOut = "Vui lòng chọn ngày trả phòng";
  else if (data.checkIn && data.checkOut <= data.checkIn) {
    errors.checkOut = "Ngày trả phòng phải sau ngày nhận phòng";
  }
  if (!data.guestName.trim()) errors.guestName = "Tên khách không được để trống";
  else if (data.guestName.trim().length < 2) errors.guestName = "Tên khách quá ngắn";
  if (data.guestPhone && !/^[0-9]{10,11}$/.test(data.guestPhone.trim())) {
    errors.guestPhone = "Số điện thoại không hợp lệ (10-11 chữ số)";
  }
  return errors;
};

export default function CreateBookingForm({ onSubmit, onCancel }) {
  const { user } = useAuth();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.hotelId) {
      getRooms(user.hotelId, "AVAILABLE")
        .then((res) => setAvailableRooms(res.data))
        .catch(() => setAvailableRooms([]));
    }
  }, [user?.hotelId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev };
        const fieldError = validate({ ...formData, [field]: value })[field];
        if (fieldError) next[field] = fieldError;
        else delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit({
      roomId: Number(formData.roomId),
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guestName: formData.guestName.trim(),
      guestPhone: formData.guestPhone.trim() || null,
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const fieldClass = (field) =>
    `${inputBase} ${errors[field] ? inputError : ""}`.trim();

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-xs text-danger">
        <AlertCircle className="h-3.5 w-3.5" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <form className={`${formPanel} mb-4`} onSubmit={handleSubmit} noValidate>
      <div className="mb-5">
        <h3 className={sectionHeading}>Đặt phòng trước</h3>
        <p className="mt-1 text-sm text-muted">
          Tạo booking mới với cùng palette màu của quầy lễ tân.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Phòng <span className="text-danger">*</span>
          </label>
          <select
            className={`${fieldClass("roomId")} disabled:cursor-not-allowed disabled:opacity-40`}
            value={formData.roomId}
            onChange={(e) => handleChange("roomId", e.target.value)}
          >
            <option value="">-- Chọn phòng trống --</option>
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                Phòng {r.roomNumber}
              </option>
            ))}
          </select>
          <FieldError field="roomId" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Tên khách <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Nguyen Van A"
            className={fieldClass("guestName")}
            value={formData.guestName}
            onChange={(e) => handleChange("guestName", e.target.value)}
          />
          <FieldError field="guestName" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Ngày nhận phòng <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={fieldClass("checkIn")}
            value={formData.checkIn}
            min={today}
            onChange={(e) => handleChange("checkIn", e.target.value)}
          />
          <FieldError field="checkIn" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Ngày trả phòng <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={fieldClass("checkOut")}
            value={formData.checkOut}
            min={formData.checkIn || today}
            onChange={(e) => handleChange("checkOut", e.target.value)}
          />
          <FieldError field="checkOut" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>Số điện thoại</label>
          <input
            type="tel"
            placeholder="VD: 0901234567"
            className={fieldClass("guestPhone")}
            value={formData.guestPhone}
            onChange={(e) => handleChange("guestPhone", e.target.value)}
          />
          <FieldError field="guestPhone" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btnAccent}>
          <Check className="h-4 w-4" />
          Đặt phòng
        </button>
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}
