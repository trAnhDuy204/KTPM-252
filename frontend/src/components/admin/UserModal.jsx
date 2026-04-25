import React, { useState, useEffect } from "react";

const UserModal = ({ formData, setFormData, onSave, onClose, hotels }) => {
  const [hotelSearch, setHotelSearch] = useState("");
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedHotels = formData.hotels || [];

  useEffect(() => {
    if (hotelSearch && showSuggestions) {
      const result = hotels.filter(
        (h) =>
          h.name.toLowerCase().includes(hotelSearch.toLowerCase()) &&
          !selectedHotels.find((selected) => selected.id === h.id)
      );
      setFilteredHotels(result);
    } else {
      setFilteredHotels([]);
    }
  }, [hotelSearch, hotels, showSuggestions, selectedHotels]);

  const handleValidateAndSave = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.hotelId
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!formData.id && !formData.password) {
      alert("Vui lòng đặt mật khẩu cho nhân viên mới!");
      return;
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="w-full max-w-lg rounded-2xl bg-card shadow-xl border border-edge overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-edge bg-raised/60">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-hi">
            {formData.id ? "Cập nhật tài khoản" : "Tạo tài khoản"}
          </h2>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* Họ tên */}
          <div>
            <label className="label">Họ và tên *</label>
            <input
              className="input text-black rounded-lg border border-edge bg-white text-sm text-hi outline-none transition focus:border-info resize-none"
              value={formData.fullName || ""}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>

          {/* Email + SĐT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                className="input text-black rounded-lg border border-edge bg-white text-sm text-hi outline-none transition focus:border-info resize-none"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">SĐT *</label>
              <input
                className="input text-black rounded-lg border border-edge bg-white text-sm text-hi outline-none transition focus:border-info resize-none"
                value={formData.phone || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]*$/.test(value)) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
                maxLength={11}
              />
            </div>
          </div>

          {/* Khách sạn */}
          <div>
            <label className="label">Thuộc khách sạn *</label>
            <select
              className="input text-black rounded-lg border border-edge bg-white text-sm text-hi outline-none transition focus:border-info resize-none"
              value={formData.hotelId || ""}
              onChange={(e) =>
                setFormData({ ...formData, hotelId: e.target.value })
              }
            >
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          </div>

          {/* Role + Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Vai trò</label>
              <select
                className="input text-black rounded-lg border border-edge bg-white text-sm text-hi outline-none transition focus:border-info resize-none"
                value={formData.role || "RECEPTION"}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="RECEPTION">Reception</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Mật khẩu</label>
              <input
                type="password"
                className="input text-black rounded-lg border border-edge bg-white text-sm text-hi outline-none transition focus:border-info resize-none"
                placeholder={
                  formData.id ? "Trống nếu giữ nguyên" : "********"
                }
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-edge bg-raised/40">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-danger/20 px-3 py-1.5 text-[11px] font-medium text-danger transition hover:bg-danger-soft/35"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleValidateAndSave}
            className="rounded-lg border border-info/20 bg-info-soft/70 px-3 py-1.5 text-[11px] font-semibold text-info transition hover:border-info hover:bg-info hover:text-white"
          >
            Lưu
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserModal;