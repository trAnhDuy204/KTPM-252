import { useEffect, useState, useMemo } from "react";
import { getRooms, createRoom, updateRoomStatus, deleteRoom } from "@/services/roomApi";
import RoomCard from "@/components/room/RoomCard";
import RoomFilterBar from "@/components/room/RoomFilterBar";
import RoomStatusSummary from "@/components/room/RoomStatusSummary";
import CreateRoomForm from "@/components/room/CreateRoomForm";

const DEFAULT_FILTERS = { status: "", type: "", floor: "", search: "" };

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
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
      const res = await getRooms(1);
      setRooms(res.data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      setFilters(DEFAULT_FILTERS);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.type && r.roomTypeName !== filters.type) return false;
      if (filters.floor) {
        const roomFloor = String(Math.floor(parseInt(r.roomNumber) / 100));
        if (roomFloor !== filters.floor) return false;
      }
      if (filters.search && !r.roomNumber.includes(filters.search.trim())) return false;
      return true;
    });
  }, [rooms, filters]);

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
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-zinc-100 mb-1">
            Quản lý phòng
          </h1>
          <p className="text-zinc-500 text-sm">Tổng quan & quản lý trạng thái</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-zinc-950 rounded-lg font-semibold text-sm active:scale-95 transition-all duration-200 cursor-pointer"
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

      <div className="space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center justify-between bg-red-500/10 text-red-400 px-4 py-3 rounded-lg border border-red-500/25 text-sm animate-fadein">
            <span className="font-medium">{error}</span>
            <button
              className="ml-3 text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none text-lg font-bold"
              onClick={() => setError("")}
            >&times;</button>
          </div>
        )}

        {/* Summary */}
        <RoomStatusSummary rooms={rooms} />

        {/* Filter */}
        <RoomFilterBar filters={filters} onChange={handleFilterChange} rooms={rooms} />

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

        {/* Result count */}
        {!loading && rooms.length > 0 && (
          <p className="text-xs text-zinc-500">
            Hiển thị <span className="text-zinc-300 font-semibold">{filteredRooms.length}</span> / {rooms.length} phòng
          </p>
        )}

        {/* Room Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin" />
            <span className="ml-3 text-zinc-400 text-sm">Đang tải...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 animate-fadein">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-zinc-300 font-medium">Chưa có phòng nào</p>
            <p className="text-zinc-500 text-sm mt-1">Bấm "Thêm phòng" để bắt đầu.</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 font-medium">Không có phòng nào khớp bộ lọc</p>
            <button
              className="mt-3 text-sm text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((room, index) => (
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
    </>
  );
}
