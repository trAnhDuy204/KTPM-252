import { useEffect, useState } from "react";
import { getRooms, createRoom, updateRoomStatus } from "@/services/roomApi";
import RoomCard from "@/components/room/RoomCard";
import RoomStatusFilter from "@/components/room/RoomStatusFilter";
import RoomStatusSummary from "@/components/room/RoomStatusSummary";
import CreateRoomForm from "@/components/room/CreateRoomForm";
import "./RoomManagement.css";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRooms(1, filterStatus || undefined);
      setRooms(res.data);
    } catch {
      setError("Không thể tải danh sách phòng");
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
      setError(err.response?.data?.message || "Tạo phòng thất bại");
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="room-management">
      <h1>Quản lý phòng - Lễ tân</h1>

      <RoomStatusSummary rooms={rooms} />

      <div className="toolbar">
        <RoomStatusFilter value={filterStatus} onChange={setFilterStatus} />
        <button className="btn-create" onClick={() => setShowCreate(!showCreate)}>
          + Thêm phòng
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showCreate && (
        <CreateRoomForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="room-grid">
          {rooms.length === 0 ? (
            <p>Không có phòng nào</p>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
