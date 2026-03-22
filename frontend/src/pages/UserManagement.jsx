import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import UserModal from './UserModal';

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
        const selectedHotels = formData.hotels || [];
        if (selectedHotels.length === 0) {
            alert("Vui lòng chọn ít nhất một khách sạn!");
            return;
        }

        try {
            const dataToSave = {
                ...formData,
                hotelId: selectedHotels[0].id //ID khách sạn chọn
            };

            await adminApi.saveUser(dataToSave);

            alert(selectedUser ? "Cập nhật thành công!" : "Tạo nhân viên thành công.");
            setIsModalOpen(false);
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
        <div className="p-8 bg-[#F8F4E1]/20 min-h-screen text-[#374151]">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-[#842A3B] uppercase tracking-tight">
                        Quản lý nhân viên
                    </h1>
                </div>

                <button
                    onClick={() => openModal()}
                    className="bg-[#842A3B] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#6e2230] transition-all font-bold uppercase text-xs tracking-widest flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Tạo tài khoản
                </button>
            </div>

            <div className="mb-8 flex gap-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full p-4 pl-12 rounded-2xl border border-gray-200 outline-none focus:border-[#842A3B] bg-white shadow-sm transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-4 opacity-30">🔍</span>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-[#842A3B]/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F4E1]/50 border-b border-[#842A3B]/10">
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest">Nhân viên</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest">Vai trò</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest">Thuộc khách sạn</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest">Liên hệ</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-6">
                                    <div className="font-bold text-[#842A3B] group-hover:underline cursor-pointer">{u.fullName}</div>
                                    <div className="text-[10px] text-gray-400 font-mono italic">ID: #{u.id}</div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${u.role === 'ADMIN'
                                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                                        : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">
                                            {hotels.find(h => h.id === Number(u.hotelId))?.name || "Toàn Hệ Thống"}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="text-sm text-gray-600">{u.email}</div>
                                    <div className="text-xs text-gray-400 italic">{u.phone || "Chưa cập nhật SĐT"}</div>
                                </td>
                                <td className="p-6 text-center">
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => openModal(u)}
                                            className="text-[#842A3B] text-xs font-bold hover:underline uppercase tracking-tighter"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-400 text-xs font-bold hover:text-red-600 uppercase tracking-tighter"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic">
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