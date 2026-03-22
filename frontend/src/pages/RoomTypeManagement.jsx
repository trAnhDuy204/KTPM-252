import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const RoomTypeManagement = () => {

    const [types, setTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({ name: '', capacity: '', basePrice: '', description: '' });

    const fetchTypes = async () => {
        try {
            const res = await adminApi.getRoomTypes();
            setTypes(res.data || []);
        } catch (err) {
            alert("Lỗi tải danh sách loại phòng!");
        }
    };

    useEffect(() => { fetchTypes(); }, []);

    //  lọc danh sách loại phòng dựa trên tên
    const filteredTypes = types.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) {
            try {
                await adminApi.deleteRoomType(id);
                fetchTypes();
            } catch (err) {
                alert("Lỗi khi xóa: Loại phòng có thể đang được sử dụng ở danh sách phòng!");
            }
        }
    };

    const openModal = (type = null) => {
        if (type) {
            setSelectedType(type);
            setFormData({ ...type });
        } else {
            setSelectedType(null);
            setFormData({ name: '', capacity: '', basePrice: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.basePrice || !formData.capacity) {
            alert("Vui lòng nhập đầy đủ thông tin!");
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
                    alert("Thông tin này đã tồn tại (Bạn chưa thay đổi gì so với dữ liệu cũ)!");
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
            alert("Lỗi lưu dữ liệu! Kiểm tra xem tên có bị trùng không nhé.");
        }
    };

    return (
        <div className="p-6 bg-[#F8F4E1]/20 min-h-screen text-[#374151]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-[#842A3B] tracking-tight uppercase">Cấu Hình Loại Phòng & Giá</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-[#842A3B] text-white px-6 py-2.5 rounded-xl hover:opacity-95 shadow-lg transition-all font-medium uppercase text-xs tracking-widest"
                >
                    + Thêm loại phòng
                </button>
            </div>

            {/* tìm kiếm */}
            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder="Tìm theo tên loại phòng (VD: Single, Family...)"
                    className="border border-[#842A3B]/10 p-3 rounded-2xl w-full max-w-md focus:border-[#842A3B] outline-none shadow-sm transition-all bg-white text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-[#842A3B]/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#F8F4E1] border-b border-[#842A3B]/20">
                        <tr>
                            <th className="p-5 font-semibold text-[#842A3B] text-xs uppercase tracking-widest">Tên loại phòng</th>
                            <th className="p-5 font-semibold text-[#842A3B] text-xs uppercase tracking-widest text-center">Sức Chứa</th>
                            <th className="p-5 font-semibold text-[#842A3B] text-xs uppercase tracking-widest text-right px-8">Giá phòng (1 đêm)</th>
                            <th className="p-5 font-semibold text-[#842A3B] text-xs uppercase tracking-widest text-left">Mô tả</th>
                            <th className="p-5 font-semibold text-[#842A3B] text-xs uppercase tracking-widest text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>

                        {filteredTypes.map(t => (
                            <tr key={t.id} className="border-b border-gray-50 hover:bg-[#F8F4E1]/40 transition-colors">
                                <td className="p-5 font-bold text-[#842A3B] tracking-wide">{t.name}</td>
                                <td className="p-5 text-center font-medium text-gray-600">{t.capacity} người</td>
                                <td className="p-5 text-right text-[#842A3B] font-semibold text-lg px-8">
                                    {Number(t.basePrice).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="p-3 text-left text-gray-600 max-w-xs whitespace-pre-line text-xs">
                                    {t.description || "Chưa có mô tả"}
                                </td>
                                <td className="p-5 text-center">
                                    <div className="flex justify-center items-center gap-4">
                                        <button onClick={() => openModal(t)} className="text-[#842A3B] font-semibold hover:underline uppercase text-xs">Sửa</button>
                                        <span className="text-gray-200">|</span>
                                        <button onClick={() => handleDelete(t.id)} className="text-[#842A3B] font-semibold hover:underline uppercase text-xs transition-colors">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredTypes.length === 0 && (
                    <div className="p-10 text-center text-gray-400 italic">Không tìm thấy loại phòng nào phù hợp...</div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border-t-[12px] border-[#842A3B] text-[#374151]">
                        <h2 className="text-xl font-semibold mb-8 text-[#842A3B] border-b border-gray-100 pb-6 uppercase tracking-tight ">
                            {selectedType ? 'Cập nhật loại phòng' : 'Tạo loại phòng'}
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Tên phân loại</label>
                                <input type="text" placeholder="VD: Master, Single..."
                                    className="w-full border border-gray-100 p-3 rounded-2xl focus:border-[#842A3B] outline-none text-[#374151]"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Sức chứa</label>
                                <input type="number" placeholder="Số người"
                                    className="w-full border border-gray-100 p-3 rounded-2xl focus:border-[#842A3B] outline-none text-[#374151]"
                                    value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-[#842A3B] uppercase mb-2 tracking-widest">Giá phòng (1 đêm)</label>
                                <input type="number" placeholder="VNĐ"
                                    className="w-full border border-gray-100 p-3 rounded-2xl focus:border-[#842A3B] outline-none text-[#374151]"
                                    value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} />
                            </div>

                            <div className="col-span-2 bg-[#F8F4E1]/50 p-5 rounded-xl border border-[#842A3B]/10">
                                <label className="block text-[12px] font-bold text-[#842A3B] uppercase mb-2 tracking-widest opacity-70">Mô tả phòng</label>
                                <textarea className="w-full bg-transparent border-none outline-none text-sm text-[#374151] font-medium leading-relaxed resize-none" rows="3"
                                    placeholder="Nhập các tiện ích, đặc điểm phòng..."
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-10">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-400 font-semibold uppercase text-xs tracking-widest hover:text-[#842A3B]">Hủy bỏ</button>
                            <button onClick={handleSave} className="px-8 py-2.5 bg-[#842A3B] text-white font-semibold rounded-2xl shadow-xl uppercase text-xs tracking-widest hover:opacity-90 transition-all">Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomTypeManagement;