import { useState, useEffect } from "react";
import { getHotels, getRoomTypes } from "@/services/roomApi";

export default function CreateRoomForm({ onSubmit, onCancel }) {
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [formData, setFormData] = useState({
    hotelId: "",
    roomTypeId: "",
    roomNumber: "",
  });

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hotelId || !formData.roomTypeId || !formData.roomNumber.trim()) return;
    onSubmit({
      hotelId: Number(formData.hotelId),
      roomTypeId: Number(formData.roomTypeId),
      roomNumber: formData.roomNumber,
    });
  };

  const inputClass =
    "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400";
  const selectClass = `${inputClass} disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`;

  return (
    <form
      className="mb-4 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm animate-fadein"
      onSubmit={handleSubmit}
    >
      <h3 className="mb-5 text-slate-900 text-lg font-bold tracking-tight">
        Thêm phòng mới
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Khách sạn
          </label>
          <select
            className={selectClass}
            value={formData.hotelId}
            onChange={(e) => handleChange("hotelId", e.target.value)}
            required
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} {h.city && `(${h.city})`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Loại phòng
          </label>
          <select
            className={selectClass}
            value={formData.roomTypeId}
            onChange={(e) => handleChange("roomTypeId", e.target.value)}
            required
            disabled={!formData.hotelId}
          >
            <option value="">-- Chọn loại phòng --</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} - {rt.capacity} người - {Number(rt.basePrice).toLocaleString()}đ
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Số phòng
          </label>
          <input
            type="text"
            placeholder="VD: 101"
            className={inputClass}
            value={formData.roomNumber}
            onChange={(e) => handleChange("roomNumber", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all duration-200 cursor-pointer border-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Tạo phòng
        </button>
        <button
          type="button"
          className="px-5 py-2.5 bg-slate-100 text-slate-500 border-none rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 hover:bg-slate-200 hover:text-slate-600 active:scale-95"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
