import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, CirclePlus } from 'lucide-react';
import { panelCard } from "@/utils/cls";

const RoomTypeManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [types, setTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({ hotelId: '', name: '', capacity: '', basePrice: '', description: '' });

    const fetchTypes = async () => {
        try {
            const res = await adminApi.getRoomTypes();
            setTypes(res.data || []);
        } catch (err) {
            alert("Lỗi tải danh sách loại phòng!");
        }
    };

    useEffect(() => { fetchTypes(); }, []);

    useEffect(() => {
        adminApi.getHotels().then(res => setHotels(res.data));
    }, []);

    //  lọc danh sách loại phòng dựa trên tên
    const filteredTypes = types.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getHotelName = (hotelId) => {
        return hotels.find(h => h.id === hotelId)?.name || "N/A";
    };

    const getHotelCity = (hotelId) => {
        return hotels.find(h => h.id === hotelId)?.city || "N/A";
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) {
            try {
                await adminApi.deleteRoomType(id);
                fetchTypes();
            } catch (err) {
                alert("Loại phòng có thể đang được sử dụng ở danh sách phòng!");
            }
        }
    };

    const openModal = (type = null) => {
        if (type) {
            setSelectedType(type);
            setFormData({ ...type, hotelId: type.hotelId || '', capacity: String(type.capacity), basePrice: String(type.basePrice) });
        } else {
            setSelectedType(null);
            setFormData({ hotelId: '', name: '', capacity: '', basePrice: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.basePrice || !formData.capacity) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const isNameExists = types.some(type =>
            type.name.toLowerCase() === formData.name.toLowerCase() &&
            type.id !== selectedType?.id // Nếu đang sửa thì bỏ qua chính nó
        );

        if (isNameExists) {
            alert("Tên loại phòng này đã tồn tại trong hệ thống!");
            return;
        }

        try {
            if (selectedType) {
                const isUnchanged =
                    formData.name === selectedType.name &&
                    Number(formData.capacity) === Number(selectedType.capacity) &&
                    Number(formData.basePrice) === Number(selectedType.basePrice) &&
                    formData.description === selectedType.description;

                if (isUnchanged) {
                    alert("Loại phòng này đã tồn tại!");
                    return;
                }
            }

            const dataToSave = {
                ...formData,
                id: selectedType ? selectedType.id : undefined,
                capacity: Number(formData.capacity),
                basePrice: Number(formData.basePrice)
            };

            await adminApi.saveRoomType(dataToSave);
            alert(selectedType ? "Cập nhật thành công!" : "Thêm mới thành công!");
            setIsModalOpen(false);
            fetchTypes();

        } catch (err) {
            alert("Lỗi lưu dữ liệu! Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="p-6  min-h-screen ">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold tracking-tight uppercase">Cấu Hình Loại Phòng & Giá</h1>
                <button
                    onClick={() => openModal()}
                    className="  inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-medium tracking-widest uppercase transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                >
                    <CirclePlus /> Thêm loại phòng
                </button>
            </div>

            {/* tìm kiếm */}
            <div className="mb-8 flex gap-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm theo tên loại phòng (VD: Single, Family...)"
                        className="text-zinc-950 w-full p-4 pl-12 rounded-2xl border border-zinc-800 outline-none   shadow-sm transition-all text-sm"
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
                                <th className="px-4 py-3 text-left font-semibold">Khách sạn</th>
                                <th className="px-4 py-3 text-left font-semibold">Tên loại phòng</th>
                                <th className="px-4 py-3 text-center font-semibold">Sức chứa</th>
                                <th className="px-4 py-3 text-right font-semibold">Giá (1 đêm)</th>
                                <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-edge">
                            {filteredTypes.map((t) => (
                                <tr
                                    key={t.id}
                                    className="bg-card transition-colors hover:bg-raised/45"
                                >
                                    {/* Khách sạn */}
                                    <td className="px-4 py-3 text-dim">
                                        {getHotelName(t.hotelId)}#{getHotelCity(t.hotelId)}
                                    </td>

                                    {/* Tên loại phòng */}
                                    <td className="px-4 py-3 font-semibold text-hi">
                                        {t.name}
                                    </td>

                                    {/* Sức chứa */}
                                    <td className="px-4 py-3 text-center text-dim">
                                        {t.capacity} người
                                    </td>

                                    {/* Giá */}
                                    <td className="px-4 py-3 text-right font-semibold text-accent">
                                        {Number(t.basePrice).toLocaleString("vi-VN")}đ
                                    </td>

                                    {/* Mô tả */}
                                    <td className="px-4 py-3 text-dim max-w-xs whitespace-pre-line break-words text-xs">
                                        {t.description || "Chưa có mô tả"}
                                    </td>

                                    {/* Thao tác */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1.5">

                                            {/* Sửa */}
                                            <button
                                                onClick={() => openModal(t)}
                                                className="rounded-lg border border-info/20 bg-info-soft/70 px-2.5 py-1.5 text-[11px] font-semibold text-info transition-all duration-200 hover:border-info hover:bg-info hover:text-white"
                                            >
                                                Sửa
                                            </button>

                                            {/* Xóa */}
                                            <button
                                                onClick={() => handleDelete(t.id)}
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

                {/* EMPTY */}
                {filteredTypes.length === 0 && (
                    <div className="p-10 text-center text-muted italic">
                        Không tìm thấy loại phòng nào phù hợp...
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-card shadow-xl border border-edge overflow-hidden">

                        {/* HEADER */}
                        <div className="px-6 py-4 border-b border-edge bg-raised/60">
                            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-hi">
                                {selectedType ? "Cập nhật loại phòng" : "Tạo loại phòng"}
                            </h2>
                        </div>

                        {/* BODY */}
                        <div className="p-6 space-y-5">

                            {/* Khách sạn */}
                            <div>
                                <label className="label">Khách sạn</label>
                                <select
                                    className="input text-gray-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
                                    value={formData.hotelId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, hotelId: e.target.value })
                                    }
                                >
                                    <option value="">-- Chọn khách sạn --</option>
                                    {hotels.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                {/* Tên phân loại */}
                                <div className="col-span-2">
                                    <label className="label">Tên phân loại</label>
                                    <input
                                        type="text"
                                        placeholder="VD: Master, Single..."
                                        className="input text-gray-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Sức chứa */}
                                <div>
                                    <label className="label">Sức chứa</label>
                                    <input
                                        type="number"
                                        placeholder="Số người"
                                        className="input text-gray-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
                                        value={formData.capacity}
                                        onChange={(e) =>
                                            setFormData({ ...formData, capacity: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Giá */}
                                <div>
                                    <label className="label">Giá (1 đêm)</label>
                                    <input
                                        type="number"
                                        placeholder="VNĐ"
                                        className="input text-gray-950 rounded-lg border border-edge  px-3 py-2 text-sm text-hi outline-none transition focus:border-info resize-none"
                                        value={formData.basePrice}
                                        onChange={(e) =>
                                            setFormData({ ...formData, basePrice: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Mô tả */}
                                <div className="col-span-2 bg-raised/40 border border-edge rounded-lg p-3">
                                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1 block">
                                        Mô tả
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Nhập các tiện ích, đặc điểm phòng..."
                                        className="w-full bg-transparent outline-none text-sm text-dim resize-none"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    />
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-edge bg-raised/40">

                            {/* Hủy */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg border border-danger/20 px-3 py-1.5 text-[11px] font-medium text-danger transition hover:bg-danger-soft/35"
                            >
                                Hủy
                            </button>

                            {/* Lưu */}
                            <button
                                onClick={handleSave}
                                className="rounded-lg border border-info/20 bg-info-soft/70 px-3 py-1.5 text-[11px] font-semibold text-info transition hover:border-info hover:bg-info hover:text-white"
                            >
                                Lưu
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomTypeManagement;