import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const RoomModal = ({ isOpen, onClose, onSave, selectedRoom }) => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [selectedTypeName, setSelectedTypeName] = useState(''); 
    const [hotelSearch, setHotelSearch] = useState('');
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [roomData, setRoomData] = useState({
        roomNumber: '',
        status: 'AVAILABLE',
        hotelId: '',
        roomType: { id: '' },
        customPrice: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                try {
                    const [resTypes, resHotels] = await Promise.all([
                        adminApi.getRoomTypes(),
                        adminApi.getHotels()
                    ]);
                    setRoomTypes(resTypes.data || []);
                    setHotels(resHotels.data || []);
                } catch (err) {
                    setRoomTypes([]); setHotels([]);
                }
            };
            loadData();

            if (selectedRoom) {
                setRoomData({
                    ...selectedRoom,
                    hotelId: selectedRoom.hotelId || '',
                    customPrice: selectedRoom.roomType?.basePrice || selectedRoom.customPrice || '',
                    description: selectedRoom.roomType?.description || ''
                });
                setSelectedTypeName(selectedRoom.roomType?.name || '');
                const currentHotel = resHotels.data?.find(h => String(h.id) === String(selectedRoom.hotelId));
                setHotelSearch(currentHotel ? currentHotel.name : '');
            } else {
                setRoomData({ roomNumber: '', status: 'AVAILABLE', hotelId: '', roomType: { id: '' }, customPrice: '', description: '' });
                setSelectedTypeName('');
            }
        }
    }, [isOpen, selectedRoom]);

    useEffect(() => {
        if (hotelSearch && showSuggestions) {
            const result = hotels.filter(h =>
                h.name.toLowerCase().includes(hotelSearch.toLowerCase())
            );
            setFilteredHotels(result);
        } else {
            setFilteredHotels([]);
        }
    }, [hotelSearch, hotels, showSuggestions]);

    // Tên Phân Loại
    const handleTypeNameChange = (e) => {
        const name = e.target.value;
        setSelectedTypeName(name);
        setRoomData({
            ...roomData,
            roomType: { id: '' },
            customPrice: '',
            description: 'Vui lòng chọn sức chứa tương ứng'
        });
    };

    //Chọn Sức chứa phòng
    const handleCapacityChange = (e) => {
        const selectedId = e.target.value;
        const selectedType = roomTypes.find(type => type.id.toString() === selectedId);
        if (selectedType) {
            setRoomData({
                ...roomData,
                roomType: { id: selectedId },
                customPrice: selectedType.basePrice,
                description: selectedType.description
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border-t-[12px] border-[#842A3B] text-[#374151]">
                <h2 className="text-2xl font-semibold mb-8 text-[#842A3B] border-b border-gray-100 pb-6 uppercase tracking-tight ">
                    {selectedRoom ? 'Cập nhật thông tin' : 'Tạo phòng mới'}
                </h2>

                <div className="grid grid-cols-2 gap-6">
                    {/* Chọn khách sạn*/}
                    <div className="col-span-2">
                        <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Chọn khách sạn</label>
                        <select className="w-full border border-gray-200 p-3 rounded-2xl focus:border-[#842A3B] outline-none bg-gray-50/30 text-sm font-medium"
                            value={roomData.hotelId}
                            onChange={e => setRoomData({ ...roomData, hotelId: e.target.value })}>
                            <option value="">Chọn</option>
                            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>

                    {/* Số phòng */}
                    <div className="col-span-1">
                        <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Số phòng</label>
                        <input type="text" placeholder="VD: P.101"
                            className="w-full border border-gray-200 p-3 rounded-2xl focus:border-[#842A3B] outline-none uppercase  text-sm"
                            value={roomData.roomNumber}
                            onChange={e => setRoomData({ ...roomData, roomNumber: e.target.value.toUpperCase() })} />
                    </div>

                    {/* Trạng thái */}
                    <div className="col-span-1">
                        <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Trạng thái</label>
                        <select className="w-full border border-gray-200 p-3 rounded-2xl focus:border-[#842A3B] outline-none text-sm font-medium"
                            value={roomData.status}
                            onChange={e => setRoomData({ ...roomData, status: e.target.value })}>
                            <option value="AVAILABLE">Trống</option>
                            <option value="OCCUPIED">Có khách</option>
                            <option value="CLEANING">Dọn dẹp</option>
                            <option value="MAINTENANCE">Bảo trì</option>
                        </select>
                    </div>

                    {/* Chọn phân loại phòng */}
                    <div className="col-span-1">
                        <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Loại phòng</label>
                        <select className="w-full border border-gray-200 p-3 rounded-2xl focus:border-[#842A3B] outline-none text-sm font-medium"
                            value={selectedTypeName}
                            onChange={handleTypeNameChange}>
                            <option value="">Chọn</option>
                            {[...new Set(roomTypes.map(t => t.name))].map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Chọn sức chứa phòng*/}
                    <div className="col-span-1">
                        <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Sức chứa</label>
                        <select
                            className={`w-full border border-gray-200 p-3 rounded-2xl focus:border-[#842A3B] outline-none text-sm font-medium ${!selectedTypeName ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            disabled={!selectedTypeName}
                            value={roomData.roomType?.id || ''}
                            onChange={handleCapacityChange}>
                            <option value="">Chọn</option>
                            {roomTypes
                                .filter(t => t.name === selectedTypeName)
                                .map(type => (
                                    <option key={type.id} value={type.id}>{type.capacity} người</option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Đặc điểm */}
                    <div className="col-span-2 bg-[#F8F4E1]/50 p-4 rounded-2xl border border-[#842A3B]/10">
                        <p className="text-[12px] font-bold text-[#842A3B] mb-1 uppercase tracking-widest opacity-70">Mô tả phòng và tiện nghi</p>
                        <div className="text-xs text-[#374151] italic font-medium leading-relaxed">
                            {roomData.description || "Mô tả sẽ hiện ở đây"}
                        </div>
                    </div>

                    {/* Giá phòng */}
                    <div className="col-span-2 bg-[#F8F4E1] p-5 rounded-2xl border border-[#842A3B]/5">
                        <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-1 tracking-widest">Giá phòng (1 đêm)</label>
                        <div className="text-2xl font-semibold text-[#842A3B]">
                            {roomData.customPrice ? Number(roomData.customPrice).toLocaleString('vi-VN') : '0'} <span className="text-xs font-bold opacity-60 uppercase">VNĐ</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 text-gray-400 font-semibold hover:text-[#842A3B] transition-colors uppercase text-[12px] tracking-widest">Hủy bỏ</button>
                    <button onClick={() => onSave(roomData)} className="px-8 py-2.5 bg-[#842A3B] text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition-all uppercase text-[12px] tracking-widest">Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default RoomModal;