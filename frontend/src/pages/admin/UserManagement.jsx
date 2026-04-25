import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import UserModal from '../../components/admin/UserModal';
import { Search, CirclePlus } from 'lucide-react';
import { panelCard } from "@/utils/cls";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', hotelId: '',
        hotelName: '', username: '', password: '', role: 'RECEPTION'
    });

    const fetchData = async () => {
        try {
            const [userRes, hotelRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getHotels()
            ]);
            setUsers(userRes.data || []);
            setHotels(hotelRes.data || []);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) {
            await adminApi.deleteUser(id);
            setSearchTerm('');
            fetchData();
        }
    };

    const openModal = (user = null) => {
        if (user) {
            const hotel = hotels.find(h => h.id === Number(user.hotelId));
            setFormData({
                ...user,
                hotelId: user.hotelId || '',
                hotelName: hotel ? hotel.name : '',
                password: ''
            });
            setSelectedUser(user);
        } else {
            setFormData({
                fullName: '', email: '', phone: '', hotelId: '',
                hotelName: '', username: '', password: '', role: 'RECEPTION'
            });
            setSelectedUser(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        // 1. Kiểm tra nếu chưa chọn khách sạn
        if (!formData.hotelId) {
            alert("Vui lòng chọn khách sạn làm việc!");
            return;
        }

        try {
            const dataToSave = {
                ...formData,
                // Đảm bảo hotelId là kiểu số để khớp với Backend
                hotelId: Number(formData.hotelId)
            };

            await adminApi.saveUser(dataToSave);

            alert(selectedUser ? "Cập nhật thành công!" : "Tạo nhân viên thành công.");
            setIsModalOpen(false);
            setSearchTerm('');
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Thông tin đã tồn tại!";
            alert("Lỗi: " + errorMessage);
        }
    };

    const filteredUsers = users.filter(u => {
        const roleLower = u.role?.toLowerCase();

        const isStaff = roleLower === 'admin' || roleLower === 'reception';

        const matchesSearch =
            u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());

        return isStaff && matchesSearch;
    });
    return (
        <div className="p-8  min-h-screen ">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold  uppercase tracking-tight">
                        Quản lý nhân viên
                    </h1>
                </div>

                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                >
                    <span className="text-lg"><CirclePlus /></span> Tạo tài khoản
                </button>
            </div>

            <div className="mb-8 flex gap-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className=" text-zinc-950 w-full p-4 pl-12 rounded-2xl border border-zinc-800 outline-none   shadow-sm transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-4 opacity-30 text-gray-600"><Search /></span>
                </div>
            </div>

            <div className={`${panelCard} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">

                        {/* HEADER */}
                        <thead>
                            <tr className="bg-raised/85 text-xs uppercase tracking-[0.18em] text-muted">
                                <th className="px-4 py-3 text-left font-semibold">Nhân viên</th>
                                <th className="px-4 py-3 text-left font-semibold">Vai trò</th>
                                <th className="px-4 py-3 text-left font-semibold">Khách sạn</th>
                                <th className="px-4 py-3 text-left font-semibold">Liên hệ</th>
                                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-edge">
                            {filteredUsers.map((u) => {
                                const hotel = hotels.find(
                                    (h) => h.id === Number(u.hotelId)
                                );

                                return (
                                    <tr
                                        key={u.id}
                                        className="bg-card transition-colors hover:bg-raised/45"
                                    >
                                        {/* Nhân viên */}
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-hi">
                                                {u.fullName}
                                            </div>
                                            <div className="text-xs font-mono text-muted">
                                                #{u.id}
                                            </div>
                                        </td>

                                        {/* Vai trò */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${u.role === "ADMIN"
                                                        ? "bg-info"
                                                        : "bg-accent"
                                                    }`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>

                                        {/* Khách sạn */}
                                        <td className="px-4 py-3 text-dim">
                                            {hotel
                                                ? `${hotel.name}#${hotel.city}`
                                                : "Chưa gán khách sạn"}
                                        </td>

                                        {/* Liên hệ */}
                                        <td className="px-4 py-3">
                                            <div className="text-dim">{u.email}</div>
                                            <div className="text-xs text-muted">
                                                {u.phone || "Chưa cập nhật SĐT"}
                                            </div>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">

                                                {/* Sửa */}
                                                <button
                                                    onClick={() => openModal(u)}
                                                    className="rounded-lg border border-info/20 bg-info-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-info transition-all duration-200 hover:border-info hover:bg-info hover:text-white"
                                                >
                                                    Sửa
                                                </button>

                                                {/* Xóa */}
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="rounded-lg border border-danger/20 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-danger transition-all duration-200 hover:bg-danger-soft/35 hover:border-danger/35"
                                                >
                                                    Xóa
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* EMPTY */}
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-muted italic">
                        Không tìm thấy nhân sự nào phù hợp với từ khóa...
                    </div>
                )}
            </div>

            {isModalOpen && (
                <UserModal
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                    hotels={hotels}
                />
            )}
        </div>
    );
};

export default UserManagement;