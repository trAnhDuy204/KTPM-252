import { useEffect, useState } from "react";
import { getRooms, createRoom, updateRoomStatus, deleteRoom } from "@/services/roomApi";
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
    <div className="room-management">
      <h1>Quản lý phòng - Lễ tân</h1>

      <RoomStatusSummary rooms={rooms} />

      <div className="toolbar">
        <RoomStatusFilter value={filterStatus} onChange={setFilterStatus} />
        <button className="btn-create" onClick={() => setShowCreate(!showCreate)}>
          + Thêm phòng
        </button>
      </div>

      {error && (
        <div className="error-msg">
          <span>{error}</span>
          <button className="error-close" onClick={() => setError("")}>x</button>
        </div>
      )}

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
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
