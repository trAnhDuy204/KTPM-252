import React from "react";

const HotelModal = ({ formData, setFormData, onSave, onClose }) => {
  const handleValidateAndSave = () => {
    if (!formData.name || !formData.city || !formData.address) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      {/* CARD */}
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-xl border border-edge overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-edge bg-raised/60">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-hi">
            {formData.id ? "Cập nhật khách sạn" : "Tạo khách sạn mới"}
          </h2>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* Tên khách sạn */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-2">
              Tên khách sạn *
            </label>
            <input
              className="w-full text-black rounded-lg border border-edge bg-white px-3 py-2 text-sm text-hi outline-none transition focus:border-info"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Thành phố */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-2">
              Thành phố *
            </label>
            <input
              className="w-full text-black rounded-lg border border-edge bg-white px-3 py-2 text-sm text-hi outline-none transition focus:border-info"
              value={formData.city || ""}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-2">
              Địa chỉ *
            </label>
            <input
              className="w-full text-black rounded-lg border border-edge bg-white px-3 py-2 text-sm text-hi outline-none transition focus:border-info"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full text-black rounded-lg border border-edge bg-white px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none h-24"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-edge bg-raised/40">

          {/* Hủy */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-danger/20 px-3 py-1.5 text-[11px] font-medium text-danger transition hover:bg-danger-soft/35 hover:border-danger/35"
          >
            Hủy
          </button>

          {/* Lưu */}
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

export default HotelModal;