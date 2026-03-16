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

  return (
    <form
      className="mb-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm"
      onSubmit={handleSubmit}
    >
      <h3 className="mb-5 text-slate-900 text-lg font-bold">Thêm phòng mới</h3>
      <div className="flex gap-5 flex-wrap mb-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Khách sạn
          </label>
          <select
            className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm min-w-55 text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Loại phòng
          </label>
          <select
            className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm min-w-55 text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Số phòng
          </label>
          <input
            type="text"
            placeholder="VD: 101"
            className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm min-w-55 text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            value={formData.roomNumber}
            onChange={(e) => handleChange("roomNumber", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-6 py-2.5 bg-green-500 text-white border-none rounded-lg cursor-pointer font-bold text-sm transition-all hover:bg-green-600 hover:shadow-md hover:shadow-green-500/30"
        >
          Tạo phòng
        </button>
        <button
          type="button"
          className="px-6 py-2.5 bg-slate-100 text-slate-500 border-none rounded-lg cursor-pointer font-semibold text-sm transition-all hover:bg-slate-200 hover:text-slate-600"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
