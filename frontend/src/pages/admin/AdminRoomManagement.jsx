import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import RoomModal from '../../components/admin/RoomModal';
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

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
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
                                    {hotels.find(h => String(h.id) === String(room.hotelId))?.name + `#${hotels.find(h => String(h.id) === String(room.hotelId))?.city}`}
                                </td>

                                <td className="p-4 text-gray-500 text-center ">{room.roomType?.capacity} người</td>

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