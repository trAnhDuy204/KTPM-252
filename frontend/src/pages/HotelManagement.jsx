import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import HotelModal from './HotelModal';
const HotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');

    const [formData, setFormData] = useState({
        name: '', city: '', address: '', description: '',

    });
    const formatCityName = (city) => {
        if (!city) return '';
        // 1. Cắt khoảng trắng 2 đầu -> 2. Biến thành chữ thường hết -> 3. Viết hoa chữ cái đầu mỗi từ
        return city.trim().toLowerCase().replace(/(^|\s)\S/g, letter => letter.toUpperCase());
    };
    const uniqueCities = [...new Set(hotels.map(h => formatCityName(h.city)))].filter(Boolean);
    const fetchData = async () => {
        try {
            const res = await adminApi.getHotels();
            setHotels(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khách sạn này?")) {
            try {
                // Gọi API xóa
                await adminApi.deleteHotel(id);
                setSearchTerm('');
                fetchData();
            } catch (err) {
                // ĐÂY LÀ CHỖ SẼ HIỆN CÂU BÁO LỖI CỦA BACKEND LÊN MÀN HÌNH NÈ
                alert("Lỗi: " + (err.response?.data?.message || "Không thể xóa khách sạn này!"));
            }
        }
    };

    const openModal = (hotel = null) => {
        if (hotel) {
            setFormData({ ...hotel });
            setSelectedHotel(hotel);
        } else {
            setFormData({ name: '', city: '', address: '', description: '' });
            setSelectedHotel(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const { created_at, ...dataToSave } = formData;

            await adminApi.saveHotel(dataToSave);

            setIsModalOpen(false);
            setSearchTerm('');
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Lỗi: " + (err.response?.data?.message || "Vui lòng kiểm tra lại API Backend!"));
        }
    };

    // THAY THẾ: Logic lọc kết hợp Search và Dropdown
    const filteredHotels = hotels.filter(h => {
        const matchesSearch = h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.city?.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. SỬA CHỖ NÀY: Ép thành phố của hotel về chuẩn trước khi so sánh với Dropdown
        const formattedHotelCity = formatCityName(h.city);
        const matchesCity = selectedCity === '' || formattedHotelCity === selectedCity;

        return matchesSearch && matchesCity;
    });

    return (
        <div className="p-8 bg-[#F8F4E1]/20 min-h-screen text-[#374151]">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold text-[#842A3B] uppercase tracking-tight">
                    Quản lý khách sạn
                </h1>
                <button
                    onClick={() => openModal()}
                    className="bg-[#842A3B] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#6e2230] transition-all font-bold uppercase text-xs tracking-widest flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Tạo khách sạn
                </button>
            </div>

            {/* THANH TÌM KIẾM VÀ LỌC */}
            <div className="mb-8 flex gap-4">
                {/* Ô Search cũ */}
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        className="w-full p-4 pl-12 rounded-2xl border border-gray-200 outline-none focus:border-[#842A3B] bg-white shadow-sm transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-4 opacity-30">🔍</span>
                </div>

                {/* THÊM 3: Bộ lọc Dropdown Thành phố */}
                <select
                    className="p-4 rounded-2xl border border-gray-200 outline-none focus:border-[#842A3B] bg-white shadow-sm transition-all text-sm min-w-[200px] text-[#842A3B] font-bold tracking-widest cursor-pointer"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    {uniqueCities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-[#842A3B]/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F4E1]/50 border-b border-[#842A3B]/10">
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest whitespace-nowrap">Khách sạn</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest whitespace-nowrap">Thành phố</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest whitespace-nowrap">Địa chỉ</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest whitespace-nowrap">Mô tả</th>
                            <th className="p-6 text-xs font-bold text-[#842A3B] uppercase tracking-widest whitespace-nowrap text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredHotels.map(h => (
                            <tr key={h.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-6">
                                    <div className="font-bold text-[#842A3B] group-hover:underline cursor-pointer">{h.name}</div>
                                    <div className="text-[10px] text-gray-400 font-mono italic">ID: #{h.id}</div>
                                </td>
                                <td className="p-6 text-sm font-medium text-gray-600">{formatCityName(h.city)}</td>
                                <td className="p-6 text-sm text-gray-600">{h.address}</td>
                                <td className="p-6 text-sm text-gray-500 max-w-md whitespace-normal break-words">{h.description}</td>
                                <td className="p-6 text-center">
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => openModal(h)} className="text-[#842A3B] text-xs font-bold hover:underline uppercase tracking-tighter">Sửa</button>
                                        <button onClick={() => handleDelete(h.id)} className="text-red-400 text-xs font-bold hover:text-red-600 uppercase tracking-tighter">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredHotels.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic">Không tìm thấy khách sạn nào...</div>
                )}
            </div>

            {isModalOpen && (
                <HotelModal
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default HotelManagement;