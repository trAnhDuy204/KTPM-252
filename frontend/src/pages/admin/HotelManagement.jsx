import React, { useState, useEffect } from 'react';
import { CirclePlus, Search } from 'lucide-react';
import { panelCard } from "@/utils/cls";
import { adminApi } from '@/services/adminApi';
import HotelModal from '@/components/admin/HotelModal';
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
        <>
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold uppercase tracking-tight">
                    Quản lý khách sạn
                </h1>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                >
                    <CirclePlus /> Tạo khách sạn
                </button>
            </div>

            {/* THANH TÌM KIẾM VÀ LỌC */}
            <div className="mb-8 flex gap-4">
                {/* Ô Search cũ */}
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        className="w-full text-zinc-950 p-4 pl-12 rounded-2xl border border-gray-200 outline-none focus:border-[#842A3B]  shadow-sm transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-4 opacity-30 text-gray-500" />
                </div>

                {/* THÊM 3: Bộ lọc Dropdown Thành phố */}
                <select
                    className="p-4 rounded-2xl text-zinc-950 border border-gray-200 outline-none focus:border-[#842A3B] shadow-sm transition-all text-sm min-w-[200px] font-bold tracking-widest cursor-pointer"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    {uniqueCities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            <div className={`${panelCard} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[840px] text-sm">

                        {/* HEADER */}
                        <thead>
                            <tr className="bg-raised/85 text-xs uppercase tracking-[0.18em] text-muted">
                                <th className="px-4 py-3 text-left font-semibold">Khách sạn</th>
                                <th className="px-4 py-3 text-left font-semibold">Thành phố</th>
                                <th className="px-4 py-3 text-left font-semibold">Địa chỉ</th>
                                <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-edge">
                            {filteredHotels.map((h) => (
                                <tr
                                    key={h.id}
                                    className="bg-card transition-colors hover:bg-raised/45"
                                >
                                    {/* Khách sạn */}
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-hi">
                                            {h.name}
                                        </div>
                                        <div className="text-xs font-mono text-muted">
                                            #{h.id}
                                        </div>
                                    </td>

                                    {/* Thành phố */}
                                    <td className="px-4 py-3 text-dim">
                                        {formatCityName(h.city)}
                                    </td>

                                    {/* Địa chỉ */}
                                    <td className="px-4 py-3 text-dim">
                                        {h.address}
                                    </td>

                                    {/* Mô tả */}
                                    <td className="px-4 py-3 text-dim max-w-md break-words">
                                        {h.description}
                                    </td>

                                    {/* Thao tác */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1.5">

                                            {/* Sửa */}
                                            <button
                                                onClick={() => openModal(h)}
                                                className="rounded-lg border border-info/20 bg-info-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-info transition-all duration-200 hover:border-info hover:bg-info hover:text-white"
                                            >
                                                Sửa
                                            </button>

                                            {/* Xóa */}
                                            <button
                                                onClick={() => handleDelete(h.id)}
                                                className="rounded-lg border border-danger/20 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-danger transition-all duration-200 hover:bg-danger-soft/35 hover:border-danger/35"
                                            >
                                                Xóa
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* EMPTY STATE */}
                {filteredHotels.length === 0 && (
                    <div className="p-10 text-center text-muted italic">
                        Không tìm thấy khách sạn nào...
                    </div>
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
        </>
    );
};

export default HotelManagement;