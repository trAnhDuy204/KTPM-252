import { useState, useEffect } from "react";
import { getRooms } from "@/services/roomApi";
import { Check, AlertCircle } from "lucide-react";

const validate = (data) => {
  const errors = {};
  if (!data.roomId) errors.roomId = "Vui lòng chọn phòng";
  if (!data.checkOut) errors.checkOut = "Vui lòng chọn ngày trả phòng";
  if (!data.guestName.trim()) errors.guestName = "Tên khách không được để trống";
  else if (data.guestName.trim().length < 2) errors.guestName = "Tên khách quá ngắn";
  if (data.guestPhone && !/^[0-9]{10,11}$/.test(data.guestPhone.trim()))
    errors.guestPhone = "Số điện thoại không hợp lệ (10–11 chữ số)";
  return errors;
};

export default function CheckInForm({ onSubmit, onCancel }) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({ roomId: "", checkOut: "", guestName: "", guestPhone: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [res, resReserved] = await Promise.all([
          getRooms(null, "AVAILABLE"),
          getRooms(null, "RESERVED"),
        ]);
        setAvailableRooms([...res.data, ...resReserved.data]);
      } catch {
        setAvailableRooms([]);
      }
    };
    fetchRooms();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      // revalidate on change after first submit attempt
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
      checkOut: formData.checkOut,
      guestName: formData.guestName.trim(),
      guestPhone: formData.guestPhone.trim() || null,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm bg-zinc-800 text-zinc-200 outline-none transition-all duration-200 placeholder:text-zinc-600 ${
      errors[field]
        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
        : "border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10"
    }`;

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    ) : null;

  return (
    <form
      className="mb-4 p-6 bg-zinc-900 border border-zinc-700/50 rounded-2xl"
      onSubmit={handleSubmit}
      noValidate
    >
      <h3 className="mb-5 text-zinc-100 text-lg font-bold tracking-tight">Check-in khách</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Phòng <span className="text-red-400">*</span>
          </label>
          <select
            className={`${inputClass("roomId")} disabled:opacity-40 disabled:cursor-not-allowed`}
            value={formData.roomId}
            onChange={(e) => handleChange("roomId", e.target.value)}
          >
            <option value="">-- Chọn phòng trống --</option>
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                Phòng {r.roomNumber} ({r.status === "RESERVED" ? "Đã đặt" : "Trống"})
              </option>
            ))}
          </select>
          <FieldError field="roomId" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Ngày trả phòng <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            className={inputClass("checkOut")}
            value={formData.checkOut}
            min={today}
            onChange={(e) => handleChange("checkOut", e.target.value)}
          />
          <FieldError field="checkOut" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Tên khách <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Nguyen Van A"
            className={inputClass("guestName")}
            value={formData.guestName}
            onChange={(e) => handleChange("guestName", e.target.value)}
          />
          <FieldError field="guestName" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Số điện thoại
          </label>
          <input
            type="tel"
            placeholder="VD: 0901234567"
            className={inputClass("guestPhone")}
            value={formData.guestPhone}
            onChange={(e) => handleChange("guestPhone", e.target.value)}
          />
          <FieldError field="guestPhone" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm active:scale-95 transition-all duration-200 cursor-pointer border-none"
        >
          <Check className="w-4 h-4" />
          Check-in
        </button>
        <button
          type="button"
          className="px-5 py-2.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg cursor-pointer font-semibold text-sm transition-all duration-200 hover:bg-zinc-700 hover:text-zinc-200 active:scale-95"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
