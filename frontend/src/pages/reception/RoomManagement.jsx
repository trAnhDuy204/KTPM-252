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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý phòng
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Lễ tân &mdash; Tổng quan & quản lý trạng thái</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all duration-200 cursor-pointer"
            onClick={() => setShowCreate(!showCreate)}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: showCreate ? "rotate(45deg)" : "none" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {showCreate ? "Đóng" : "Thêm phòng"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm animate-fadein">
            <span className="font-medium">{error}</span>
            <button
              className="ml-3 text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none text-lg font-bold"
              onClick={() => setError("")}
            >&times;</button>
          </div>
        )}

        {/* Summary */}
        <RoomStatusSummary rooms={rooms} />

        {/* Filter */}
        <RoomStatusFilter value={filterStatus} onChange={setFilterStatus} />

        {/* Create Form with slide animation */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{
            gridTemplateRows: showCreate ? "1fr" : "0fr",
            opacity: showCreate ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            <CreateRoomForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="ml-3 text-slate-400 text-sm">Đang tải...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 animate-fadein">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">Chưa có phòng nào</p>
            <p className="text-slate-400 text-sm mt-1">Bấm "Thêm phòng" để bắt đầu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room, index) => (
              <div
                key={room.id}
                className="animate-fadein"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <RoomCard
                  room={room}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
