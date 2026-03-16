import { useEffect, useState } from "react";
import { getRooms, createRoom, updateRoomStatus, deleteRoom } from "@/services/roomApi";
import RoomCard from "@/components/room/RoomCard";
import RoomStatusFilter from "@/components/room/RoomStatusFilter";
import RoomStatusSummary from "@/components/room/RoomStatusSummary";
import CreateRoomForm from "@/components/room/CreateRoomForm";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const showError = (err) => {
    const data = err.response?.data;
    let msg = data?.message || err.message || "Đã có lỗi xảy ra";
    if (data?.validationErrors) {
      const details = Object.values(data.validationErrors).join(", ");
      msg = `${msg}: ${details}`;
    }
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRooms(1, filterStatus || undefined);
      setRooms(res.data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filterStatus]);

  const handleCreate = async (formData) => {
    try {
      await createRoom(formData);
      setShowCreate(false);
      fetchRooms();
    } catch (err) {
      showError(err);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
      fetchRooms();
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
    try {
      await deleteRoom(roomId);
      fetchRooms();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Quản lý phòng - Lễ tân
        </h1>
        <button
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer"
          onClick={() => setShowCreate(!showCreate)}
        >
          + Thêm phòng
        </button>
      </div>

      <RoomStatusSummary rooms={rooms} />

      <div className="flex justify-between items-center mb-5 flex-wrap gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200">
        <RoomStatusFilter value={filterStatus} onChange={setFilterStatus} />
      </div>

      {error && (
        <div className="flex justify-between items-center bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 border border-red-200 text-sm">
          <span>{error}</span>
          <button
            className="bg-transparent border-none text-red-600 cursor-pointer text-lg font-bold px-1 leading-none"
            onClick={() => setError("")}
          >
            x
          </button>
        </div>
      )}

      {showCreate && (
        <CreateRoomForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <p className="text-slate-400 text-center py-8">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {rooms.length === 0 ? (
            <p className="text-center py-16 text-slate-400 text-base col-span-full">
              Chưa có phòng nào. Bấm "+ Thêm phòng" để bắt đầu.
            </p>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
