import { useState, useEffect } from "react";
import { AlertCircle, Check } from "lucide-react";
import { getHotels, getRoomTypes } from "@/services/roomApi";
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
  if (!data.hotelId) errors.hotelId = "Vui lòng chọn khách sạn";
  if (!data.roomTypeId) errors.roomTypeId = "Vui lòng chọn loại phòng";
  if (!data.roomNumber.trim()) errors.roomNumber = "Vui lòng nhập số phòng";
  else if (!/^[A-Za-z0-9-]+$/.test(data.roomNumber.trim())) {
    errors.roomNumber = "Số phòng chỉ gồm chữ, số và dấu gạch ngang";
  }
  return errors;
};

export default function CreateRoomForm({ onSubmit, onCancel }) {
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [formData, setFormData] = useState({
    hotelId: "",
    roomTypeId: "",
    roomNumber: "",
  });
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
    <form className={`${formPanel} animate-fadein`} onSubmit={handleSubmit} noValidate>
      <div className="mb-5">
        <h3 className={sectionHeading}>Thêm phòng mới</h3>
        <p className="mt-1 text-sm text-muted">
          Khai báo khách sạn, loại phòng và mã phòng theo cùng một hệ giao diện.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Khách sạn <span className="text-danger">*</span>
          </label>
          <select
            className={`${fieldClass("hotelId")} disabled:cursor-not-allowed disabled:opacity-40`}
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

        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Loại phòng <span className="text-danger">*</span>
          </label>
          <select
            className={`${fieldClass("roomTypeId")} disabled:cursor-not-allowed disabled:opacity-40`}
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

        <div className="flex flex-col gap-1.5">
          <label className={label}>
            Số phòng <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: 101"
            className={fieldClass("roomNumber")}
            value={formData.roomNumber}
            onChange={(e) => handleChange("roomNumber", e.target.value)}
          />
          <FieldError field="roomNumber" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btnAccent}>
          <Check className="h-4 w-4" />
          Tạo phòng
        </button>
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}
