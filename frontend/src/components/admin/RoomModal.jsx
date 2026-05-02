import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/adminApi";

const RoomModal = ({ isOpen, onClose, onSave, selectedRoom }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedTypeName, setSelectedTypeName] = useState("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [roomData, setRoomData] = useState({
    roomNumber: "",
    status: "AVAILABLE",
    hotelId: "",
    roomType: { id: "" },
    customPrice: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [resTypes, resHotels] = await Promise.all([
            adminApi.getRoomTypes(),
            adminApi.getHotels(),
          ]);
          const fetchedTypes = resTypes.data || [];
          const fetchedHotels = resHotels.data || [];

          setRoomTypes(fetchedTypes);
          setHotels(fetchedHotels);

          if (selectedRoom) {
            setRoomData({
              ...selectedRoom,
              hotelId: selectedRoom.hotelId || "",
              customPrice:
                selectedRoom.roomType?.basePrice ||
                selectedRoom.customPrice ||
                "",
              description: selectedRoom.roomType?.description || "",
            });
            setSelectedTypeName(selectedRoom.roomType?.name || "");

            const currentHotel = fetchedHotels.find(
              (h) => String(h.id) === String(selectedRoom.hotelId)
            );
            setHotelSearch(currentHotel ? currentHotel.name : "");
          } else {
            setRoomData({
              roomNumber: "",
              status: "AVAILABLE",
              hotelId: "",
              roomType: { id: "" },
              customPrice: "",
              description: "",
            });
            setSelectedTypeName("");
            setHotelSearch("");
          }
        } catch {
          setRoomTypes([]);
          setHotels([]);
        }
      };
      loadData();
    }
  }, [isOpen, selectedRoom]);

  const filteredRoomTypesByHotel = roomTypes.filter(
    (t) => String(t.hotelId) === String(roomData.hotelId)
  );

  const handleTypeNameChange = (e) => {
    const name = e.target.value;
    setSelectedTypeName(name);
    setRoomData({
      ...roomData,
      roomType: { id: "" },
      customPrice: "",
      description: "Vui lòng chọn sức chứa tương ứng",
    });
  };

  const handleCapacityChange = (e) => {
    const selectedId = e.target.value;
    const selectedType = roomTypes.find(
      (type) => type.id.toString() === selectedId
    );
    if (selectedType) {
      setRoomData({
        ...roomData,
        roomType: { id: selectedId },
        customPrice: selectedType.basePrice,
        description: selectedType.description,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl border border-edge overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-edge bg-raised/60">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-hi">
            {selectedRoom ? "Cập nhật phòng" : "Tạo phòng mới"}
          </h2>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-2 gap-4">

          {/* Khách sạn */}
          <div className="col-span-2">
            <label className="label">Khách sạn</label>
            <select
              className="input text-zinc-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
              value={roomData.hotelId}
              onChange={(e) => {
                const hotelId = e.target.value;
                setRoomData({
                  ...roomData,
                  hotelId,
                  roomType: { id: "" },
                  customPrice: "",
                  description: "",
                });
                setSelectedTypeName("");
              }}
            >
              <option value="">Chọn</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Số phòng */}
          <div>
            <label className="label">Số phòng</label>
            <input
              className="input text-zinc-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
              value={roomData.roomNumber}
              onChange={(e) =>
                setRoomData({
                  ...roomData,
                  roomNumber: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="label">Trạng thái</label>
            <select
              className="input text-zinc-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
              value={roomData.status}
              onChange={(e) =>
                setRoomData({ ...roomData, status: e.target.value })
              }
            >
              <option value="AVAILABLE">Trống</option>
              <option value="RESERVED">Đã đặt</option>
              <option value="OCCUPIED">Có khách</option>
              <option value="CLEANING">Dọn dẹp</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          {/* Loại phòng */}
          <div>
            <label className="label">Loại phòng</label>
            <select
              className="input text-zinc-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
              disabled={!roomData.hotelId}
              value={selectedTypeName}
              onChange={handleTypeNameChange}
            >
              <option value="">Chọn</option>
              {[...new Set(filteredRoomTypesByHotel.map((t) => t.name))].map(
                (name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Sức chứa */}
          <div>
            <label className="label">Sức chứa</label>
            <select
              className="input text-zinc-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
              disabled={!roomData.hotelId || !selectedTypeName}
              value={roomData.roomType?.id || ""}
              onChange={handleCapacityChange}
            >
              <option value="">Chọn</option>
              {filteredRoomTypesByHotel
                .filter((t) => t.name === selectedTypeName)
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.capacity} người
                  </option>
                ))}
            </select>
          </div>

          {/* Mô tả */}
          <div className="col-span-2 bg-raised/40 border border-edge rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1">
              Mô tả
            </p>
            <div className="text-sm text-dim italic">
              {roomData.description || "Mô tả sẽ hiện ở đây"}
            </div>
          </div>

          {/* Giá */}
          <div className="col-span-2 bg-raised/60 border border-edge rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1">
              Giá (1 đêm)
            </p>
            <div className="text-lg font-semibold text-accent">
              {roomData.customPrice
                ? Number(roomData.customPrice).toLocaleString("vi-VN")
                : "0"}{" "}
              đ
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-edge bg-raised/40">
          <button
            onClick={onClose}
            className="rounded-lg border border-danger/20 px-3 py-1.5 text-[11px] text-danger hover:bg-danger-soft/35"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(roomData)}
            className="rounded-lg border border-info/20 bg-info-soft/70 px-3 py-1.5 text-[11px] font-semibold text-info hover:bg-info hover:text-white"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;