import React, { useState, useEffect } from 'react';

const UserModal = ({ formData, setFormData, onSave, onClose, hotels }) => {
    const [hotelSearch, setHotelSearch] = useState('');
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const selectedHotels = formData.hotels || [];

    useEffect(() => {
        if (hotelSearch && showSuggestions) {
            const result = hotels.filter(h =>
                h.name.toLowerCase().includes(hotelSearch.toLowerCase()) &&
                !selectedHotels.find(selected => selected.id === h.id)
            );
            setFilteredHotels(result);
        } else {
            setFilteredHotels([]);
        }
    }, [hotelSearch, hotels, showSuggestions, selectedHotels]);

    //thêm khách sạn
    const addHotel = (h) => {
        const newHotels = [...selectedHotels, { id: h.id, name: h.name }];
        setFormData({ ...formData, hotels: newHotels });
        setHotelSearch('');
        setShowSuggestions(false);
    };

    //  xóa khách sạn 
    const removeHotel = (id) => {
        const newHotels = selectedHotels.filter(h => h.id !== id);
        setFormData({ ...formData, hotels: newHotels });
    };

    //  Kiểm tra nhập đủ thông tin chưa rồi mới cho lưu
    const handleValidateAndSave = () => {
        // Thay selectedHotels.length === 0 bằng !formData.hotelId
        if (!formData.fullName || !formData.email || !formData.phone || !formData.hotelId) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Tạo mật khẩu cho nhân viên mới
        if (!formData.id && !formData.password) {
            alert("Vui lòng đặt mật khẩu cho nhân viên mới!");
            return;
        }

        onSave();
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border-t-[10px] border-[#842A3B]">
                <div className="p-10">
                    <h2 className="text-xl font-bold text-[#842A3B] uppercase mb-8 border-b pb-4">
                        {formData.id ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
                    </h2>

                    <div className="space-y-5">
                        {/* Họ và Tên */}
                        <div>
                            <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Họ và Tên *</label>
                            <input
                                className="w-full p-4 bg-gray-50 border text-zinc-800 border-gray-100 rounded-2xl outline-none focus:border-[#842A3B] text-sm font-semibold"
                                value={formData.fullName || ''}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        {/* Email & SĐT */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Email *</label>
                                <input
                                    className="w-full p-4 text-zinc-800 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Số điện thoại *</label>
                                <input
                                    className="w-full p-4 text-zinc-800 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                                    value={formData.phone || ''}
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (/^[0-9]*$/.test(value)) {
                                            setFormData({ ...formData, phone: value });
                                        }
                                    }}
                                    maxLength={11}
                                />
                            </div>
                        </div>

                        {/* CHỌN KHÁCH SẠN LÀM VIỆC */}
                        <div>
                            <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Thuộc khách sạn *</label>
                            <select
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#842A3B] text-sm font-semibold text-[#374151]"
                                value={formData.hotelId || ''}
                                onChange={e => setFormData({ ...formData, hotelId: e.target.value })}
                            >
                                <option value="">-- Chọn một khách sạn --</option>
                                {hotels.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.name} ({h.city})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vai trò & Mật khẩu */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Vai trò</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-[#842A3B]"
                                    value={formData.role || 'RECEPTION'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="RECEPTION">Reception</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Mật khẩu </label>
                                <input
                                    type="password"
                                    className="w-full p-4 text-zinc-800 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                                    placeholder={formData.id ? "Trống nếu giữ nguyên" : "********"}
                                    value={formData.password || ''}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button type="button" onClick={onClose} className="flex-1 p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hủy bỏ</button>
                        <button
                            type="button"
                            onClick={handleValidateAndSave}
                            className="flex-1 p-4 bg-[#842A3B] text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-[#6e2230] transition-all uppercase tracking-widest"
                        >
                            Lưu thông tin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserModal;