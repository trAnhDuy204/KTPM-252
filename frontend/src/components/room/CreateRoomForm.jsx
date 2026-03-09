import { useState, useEffect } from "react";
import { getHotels, getRoomTypes } from "@/services/roomApi";
import "./CreateRoomForm.css";

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
    <form className="create-room-form" onSubmit={handleSubmit}>
      <h3>Thêm phòng mới</h3>
      <div className="form-fields">
        <div className="form-group">
          <label>Khách sạn</label>
          <select
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
        <div className="form-group">
          <label>Loại phòng</label>
          <select
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
        <div className="form-group">
          <label>Số phòng</label>
          <input
            type="text"
            placeholder="VD: 101"
            value={formData.roomNumber}
            onChange={(e) => handleChange("roomNumber", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-buttons">
        <button type="submit" className="btn-save">Tạo phòng</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}
