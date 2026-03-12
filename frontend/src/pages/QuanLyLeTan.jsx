import { useState } from "react";

function QuanLyLeTan() {

  const [users, setUsers] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editId, setEditId] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
  };

  const validate = () => {

    if (!fullName || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return false;
    }

    return true;
  };

  const saveUser = () => {

    if (!validate()) return;

    if (editId !== null) {

      const updatedUsers = users.map(user =>
        user.id === editId
          ? { ...user, fullName, email, password, phone }
          : user
      );

      setUsers(updatedUsers);

      alert("Cập nhật tài khoản thành công");

    } else {

      const newUser = {
        id: Date.now(),
        fullName,
        email,
        password,
        phone,
        role: "RECEPTION"
      };

      setUsers([...users, newUser]);

      alert("Tạo tài khoản lễ tân thành công");
    }

    setShowForm(false);
    setEditId(null);
    resetForm();
  };

  const editUser = (user) => {

    setFullName(user.fullName);
    setEmail(user.email);
    setPassword(user.password);
    setPhone(user.phone);

    setEditId(user.id);

    setShowForm(true);
  };

  const deleteUser = (id) => {

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa tài khoản này?");

    if (confirmDelete) {

      setUsers(users.filter(user => user.id !== id));

      alert("Xóa tài khoản thành công");
    }
  };

  return (

    <div style={{ padding: "40px" }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        <h1 style={{ textTransform: "uppercase" }}>
          Quản lý lễ tân
        </h1>

        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "6px 14px",
            fontWeight: "bold"
          }}
        >
          Thêm lễ tân
        </button>

      </div>

      {/* DANH SÁCH */}

      <table border="1" cellPadding="10" style={{ marginTop: "30px", width: "100%" }}>

        <thead>

          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>

        </thead>

        <tbody>

          {users.map(user => (

            <tr key={user.id}>

              <td>{user.fullName}</td>

              <td>{user.email}</td>

              <td>{user.phone}</td>

              <td>{user.role}</td>

              <td>

                <button onClick={() => editUser(user)}>
                  Sửa
                </button>

                <button
                  onClick={() => deleteUser(user.id)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  Xóa
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* POPUP */}

      {showForm && (

        <div style={overlayStyle}>

          <div style={popupStyle}>

            <h2>{editId ? "Chỉnh sửa lễ tân" : "Thêm lễ tân"}</h2>

            <input
              placeholder="Họ tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <br /><br />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />

            <input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <br /><br />

            <button
              onClick={saveUser}
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

export default QuanLyLeTan;