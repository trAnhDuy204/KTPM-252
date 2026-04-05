import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import RoomModal from '../../components/admin/RoomModal';

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
        <div className="p-8 bg-[#F8F4E1]/20 min-h-screen text-[#374151]">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-[#842A3B] tracking-tight uppercase
                ">Danh sách phòng</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-[#842A3B] text-white px-6 py-2.5 rounded-xl hover:opacity-90 shadow-md transition-all font-medium uppercase text-xs tracking-widest"
                >
                    + Thêm phòng mới
                </button>
            </div>

            {/* Tim kiếm Danh sách phòng*/}
            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Tìm theo số phòng (VD: P101,...)"
                    className="border border-[#842A3B]/10 p-3 rounded-2xl w-full max-w-md focus:border-[#842A3B] outline-none shadow-sm transition-all bg-white text-sm "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="border border-gray-200 p-3 rounded-2xl w-64 focus:border-[#842A3B] outline-none shadow-sm bg-white text-sm font-medium text-[#842A3B]"
                    value={selectedHotelName}
                    onChange={(e) => setSelectedHotelName(e.target.value)}
                >
                    <option value="">Tất cả khách sạn</option>
                    {hotels.map(h => (
                        <option key={h.id} value={String(h.id)}>{h.name}</option>))}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8F4E1]/50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest">Số phòng</th>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest">Phân loại</th>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest">Khách sạn</th>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest text-center">Sức chứa</th>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest text-center">Giá phòng (1 đêm)</th>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="p-5 font-bold text-[#842A3B] text-xs uppercase tracking-widest text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredRooms.map(room => (
                            <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-bold text-[#842A3B] uppercase tracking-wide">{room.roomNumber}</td>

                                <td className="p-4 text-gray-600 font-medium text-sm">{room.roomType?.name}</td>

                                <td className="p-4 text-gray-600 font-medium text-sm">
                                    {hotels.find(h => String(h.id) === String(room.hotelId))?.name || `Chi nhánh #${room.hotelId}`}
                                </td>                                <td className="p-4 text-gray-500 text-center ">{room.roomType?.capacity} người</td>

                                <td className="p-4 text-[#842A3B] font-semibold text-center px-8 text-base">
                                    {Number(room.roomType?.basePrice || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${room.status === 'AVAILABLE'
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-[#842A3B]/5 text-[#842A3B] border-[#842A3B]/10'
                                        }`}>
                                        {getStatusVn(room.status)}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <button onClick={() => openModal(room)} className="text-[#842A3B] font-semibold text-xs hover:underline uppercase">Sửa</button>
                                        <span className="text-gray-200">|</span>
                                        <button onClick={() => handleDelete(room.id)} className="text-[#842A3B] font-semibold text-xs hover:text-red-600 uppercase">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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