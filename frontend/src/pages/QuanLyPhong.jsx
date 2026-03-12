import { useState } from "react";

function QuanLyPhong() {

  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Trống");

  const resetForm = () => {
    setType("");
    setPrice("");
    setRoomNumber("");
    setCapacity("");
    setDescription("");
    setStatus("Trống");
  };

  const validate = () => {

    if (!type || !price || !roomNumber || !capacity) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return false;
    }

    if (isNaN(price)) {
      alert("Giá phải là số");
      return false;
    }

    if (isNaN(roomNumber)) {
      alert("Số phòng phải là số");
      return false;
    }

    if (isNaN(capacity)) {
      alert("Số lượng khách phải là số");
      return false;
    }

    return true;
  };

  const saveRoom = () => {

    if (!validate()) return;

    if (editId !== null) {

      const updatedRooms = rooms.map(room =>
        room.id === editId
          ? { ...room, type, price, roomNumber, capacity, description, status }
          : room
      );

      setRooms(updatedRooms);

      alert("Cập nhật phòng thành công");

    } else {

      const newRoom = {
        id: Date.now(),
        type,
        price,
        roomNumber,
        capacity,
        description,
        status
      };

      setRooms([...rooms, newRoom]);

      alert("Lưu phòng thành công");
    }

    setShowForm(false);
    setEditId(null);
    resetForm();
  };

  const editRoom = (room) => {

    setType(room.type);
    setPrice(room.price);
    setRoomNumber(room.roomNumber);
    setCapacity(room.capacity);
    setDescription(room.description);
    setStatus(room.status);

    setEditId(room.id);

    setShowForm(true);
  };

  const deleteRoom = (id) => {

    const room = rooms.find(r => r.id === id);

    if (room.status === "Có khách") {
      alert("Không thể xóa phòng đang có khách");
      return;
    }

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa phòng này?");

    if (confirmDelete) {

      setRooms(rooms.filter(r => r.id !== id));

      alert("Xóa phòng thành công");
    }
  };

  return (

    <div style={{ padding: "40px" }}>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        <h1 style={{ textTransform: "uppercase" }}>
          Quản lý phòng
        </h1>

        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "6px 14px",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer"
          }}
        >
          Thêm phòng
        </button>

      </div>

      {/* DANH SÁCH PHÒNG */}

      <div style={{
        marginTop: "40px",
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "20px"
      }}>

        {rooms.map(room => (

          <div
            key={room.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px"
            }}
          >

            <h3>Phòng {room.roomNumber}</h3>

            <p>Loại: {room.type}</p>

            <p>Giá: {room.price}</p>

            <p>Khách: {room.capacity}</p>

            <p>Trạng thái: {room.status}</p>

            <button
              onClick={() => editRoom(room)}
              style={{ marginRight: "10px" }}
            >
              Sửa
            </button>

            <button
              onClick={() => deleteRoom(room.id)}
              style={{ background: "red", color: "white" }}
            >
              Xóa
            </button>

          </div>

        ))}

      </div>

      {/* POPUP */}

      {showForm && (

        <div style={overlayStyle}>

          <div style={popupStyle}>

            <h2>{editId ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</h2>

            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Chọn loại phòng</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>VIP</option>
            </select>

            <br /><br />

            <input
              placeholder="Giá"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <br /><br />

            <input
              placeholder="Số phòng"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />

            <br /><br />

            <input
              placeholder="Số lượng khách"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />

            <br /><br />

            <textarea
              placeholder="Mô tả phòng"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <br /><br />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Trống</option>
              <option>Có khách</option>
              <option>Đang dọn</option>
              <option>Bảo trì</option>
            </select>

            <br /><br />

            <button
              onClick={saveRoom}
              style={{
                background: "green",
                color: "white",
                border: "none",
                padding: "6px 12px",
                marginRight: "10px"
              }}
            >
              Lưu
            </button>

            <button onClick={() => setShowForm(false)}>
              Hủy
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const popupStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "10px",
  width: "320px"
};

export default QuanLyPhong;