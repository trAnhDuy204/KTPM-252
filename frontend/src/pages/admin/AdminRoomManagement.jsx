import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import RoomModal from '../../components/admin/RoomModal';
import { panelCard } from "@/utils/cls";
import { Search, CirclePlus } from 'lucide-react';

export const getStatusVn = (status) => {
    const map = { 'AVAILABLE': 'Trống', 'OCCUPIED': 'Có khách', 'CLEANING': 'Dọn dẹp', 'MAINTENANCE': 'Bảo trì' };
    return map[status] || 'Trống';
};

const AdminRoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHotelName, setSelectedHotelName] = useState(''); // Lọc theo chi nhánh
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const fetchData = async () => {
        const [roomRes, hotelRes] = await Promise.all([
            adminApi.getAllRooms(),
            adminApi.getHotels()
        ]);

        setRooms(roomRes.data || []);
        setHotels(hotelRes.data || []);
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa phòng?")) {
            try {
                await adminApi.deleteRoom(id);
                fetchData();
            } catch (err) {
                alert("Lỗi khi xóa phòng!");
            }
        }
    };

    const openModal = (room = null) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleSave = async (roomData) => {
        if (!roomData.hotelId || !roomData.roomNumber || !roomData.roomType?.id) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        try {
            const dataToSave = {
                ...roomData,
                hotel: { id: parseInt(roomData.hotelId) },
                status: roomData.id ? roomData.status : 'AVAILABLE'
            };

            await adminApi.saveRoom(dataToSave);
            alert(selectedRoom ? "Cập nhật thành công!" : "Tạo phòng thành công.");
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert("Phòng đã tồn tại!");
        }
    };



    // Tìm phòng
    const filteredRooms = rooms.filter(r => {
        const matchNumber = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchHotel = selectedHotelName === '' || String(r.hotelId) === selectedHotelName;
        return matchNumber && matchHotel;
    });

    return (
        <div className="p-8  min-h-screen ">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold  tracking-tight uppercase
                ">Danh sách phòng</h1>
                <button
                    onClick={() => openModal()}
                    className=" inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                >
                    <CirclePlus /> Thêm phòng mới
                </button>
            </div>

            {/* Tim kiếm Danh sách phòng*/}
            <div className="mb-8 flex gap-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm theo số phòng (VD: P101,...)"
                        className="text-zinc-950 w-full p-4 pl-12 rounded-2xl border border-zinc-800 outline-none   shadow-sm transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-4 opacity-30 text-gray-600"><Search /></span>
                </div>


                <select
                    className="border border-zinc-800 p-3 rounded-2xl w-full max-w-md outline-none shadow-sm transition-all text-sm text-gray-600"
                    value={selectedHotelName}
                    onChange={(e) => setSelectedHotelName(e.target.value)}
                >
                    <option value="">Tất cả khách sạn</option>
                    {hotels.map(h => (
                        <option key={h.id} value={String(h.id)}>{h.name}</option>))}
                </select>
            </div>

            <div className={`${panelCard} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">

                        {/* HEADER */}
                        <thead>
                            <tr className="bg-raised/85 text-xs uppercase tracking-[0.18em] text-muted">
                                <th className="px-4 py-3 text-left font-semibold">Số phòng</th>
                                <th className="px-4 py-3 text-left font-semibold">Phân loại</th>
                                <th className="px-4 py-3 text-left font-semibold">Khách sạn</th>
                                <th className="px-4 py-3 text-center font-semibold">Sức chứa</th>
                                <th className="px-4 py-3 text-center font-semibold">Giá (1 đêm)</th>
                                <th className="px-4 py-3 text-center font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-edge">
                            {filteredRooms.map((room) => {
                                const hotel = hotels.find(
                                    (h) => String(h.id) === String(room.hotelId)
                                );

                                return (
                                    <tr
                                        key={room.id}
                                        className="bg-card transition-colors hover:bg-raised/45"
                                    >
                                        {/* Số phòng */}
                                        <td className="px-4 py-3 font-semibold text-hi">
                                            {room.roomNumber}
                                        </td>

                                        {/* Phân loại */}
                                        <td className="px-4 py-3 text-dim">
                                            {room.roomType?.name}
                                        </td>

                                        {/* Khách sạn */}
                                        <td className="px-4 py-3 text-dim">
                                            {hotel?.name}#{hotel?.city}
                                        </td>

                                        {/* Sức chứa */}
                                        <td className="px-4 py-3 text-center text-dim">
                                            {room.roomType?.capacity} người
                                        </td>

                                        {/* Giá */}
                                        <td className="px-4 py-3 text-center font-semibold text-accent">
                                            {Number(room.roomType?.basePrice || 0).toLocaleString("vi-VN")}đ
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${room.status === "AVAILABLE"
                                                        ? "bg-success"
                                                        : "bg-danger"
                                                    }`}
                                            >
                                                {getStatusVn(room.status)}
                                            </span>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">

                                                {/* Sửa */}
                                                <button
                                                    onClick={() => openModal(room)}
                                                    className="rounded-lg border border-info/20 bg-info-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-info transition-all duration-200 hover:border-info hover:bg-info hover:text-white"
                                                >
                                                    Sửa
                                                </button>

                                                {/* Xóa */}
                                                <button
                                                    onClick={() => handleDelete(room.id)}
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
            </div>

            <RoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                selectedRoom={selectedRoom}
                hotels={hotels}
            />
        </div>
    );
};

export default AdminRoomManagement;