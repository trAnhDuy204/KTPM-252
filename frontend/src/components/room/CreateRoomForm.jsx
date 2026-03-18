import { useState, useEffect } from "react";
import { getHotels, getRoomTypes } from "@/services/roomApi";
import { Check, AlertCircle } from "lucide-react";

const validate = (data) => {
  const errors = {};
  if (!data.hotelId) errors.hotelId = "Vui lòng chọn khách sạn";
  if (!data.roomTypeId) errors.roomTypeId = "Vui lòng chọn loại phòng";
  if (!data.roomNumber.trim()) errors.roomNumber = "Vui lòng nhập số phòng";
  else if (!/^[A-Za-z0-9\-]+$/.test(data.roomNumber.trim()))
    errors.roomNumber = "Số phòng chỉ gồm chữ, số và dấu gạch ngang";
  return errors;
};

export default function CreateRoomForm({ onSubmit, onCancel }) {
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [formData, setFormData] = useState({ hotelId: "", roomTypeId: "", roomNumber: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getHotels().then((res) => setHotels(res.data));
  }, []);

  useEffect(() => {
    if (formData.hotelId) {
      getRoomTypes(formData.hotelId).then((res) => setRoomTypes(res.data));
      setFormData((prev) => ({ ...prev, roomTypeId: "" }));
    } else {
      setRoomTypes([]);
    }
  }, [formData.hotelId]);

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
      hotelId: Number(formData.hotelId),
      roomTypeId: Number(formData.roomTypeId),
      roomNumber: formData.roomNumber.trim(),
    });
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm bg-zinc-800 text-zinc-200 outline-none transition-all duration-200 placeholder:text-zinc-600 ${
      errors[field]
        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
        : "border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10"
    }`;

  const selectClass = (field) =>
    `${inputClass(field)} disabled:opacity-40 disabled:cursor-not-allowed`;

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    ) : null;

  return (
    <form
      className="mb-4 p-6 bg-zinc-900 border border-zinc-700/50 rounded-2xl animate-fadein"
      onSubmit={handleSubmit}
      noValidate
    >
      <h3 className="mb-5 text-zinc-100 text-lg font-bold tracking-tight">Thêm phòng mới</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Khách sạn <span className="text-red-400">*</span>
          </label>
          <select
            className={selectClass("hotelId")}
            value={formData.hotelId}
            onChange={(e) => handleChange("hotelId", e.target.value)}
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} {h.city && `(${h.city})`}
              </option>
            ))}
          </select>
          <FieldError field="hotelId" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Loại phòng <span className="text-red-400">*</span>
          </label>
          <select
            className={selectClass("roomTypeId")}
            value={formData.roomTypeId}
            onChange={(e) => handleChange("roomTypeId", e.target.value)}
            disabled={!formData.hotelId}
          >
            <option value="">-- Chọn loại phòng --</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} - {rt.capacity} người - {Number(rt.basePrice).toLocaleString()}đ
              </option>
            ))}
          </select>
          <FieldError field="roomTypeId" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Số phòng <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: 101"
            className={inputClass("roomNumber")}
            value={formData.roomNumber}
            onChange={(e) => handleChange("roomNumber", e.target.value)}
          />
          <FieldError field="roomNumber" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-zinc-950 rounded-lg font-semibold text-sm active:scale-95 transition-all duration-200 cursor-pointer border-none"
        >
          <Check className="w-4 h-4" />
          Tạo phòng
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
