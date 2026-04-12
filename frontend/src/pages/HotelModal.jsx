import React from 'react';

const HotelModal = ({ formData, setFormData, onSave, onClose }) => {
    const handleValidateAndSave = () => {
        if (!formData.name || !formData.city || !formData.address) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
            return;
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border-t-[10px] border-[#842A3B]">
                <div className="p-10">
                    <h2 className="text-xl font-bold text-[#842A3B] uppercase mb-8 border-b pb-4">
                        {formData.id ? 'Cập nhật khách sạn' : 'Tạo khách sạn mới'}                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Tên khách sạn *</label>
                            <input
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#842A3B] text-sm font-semibold"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Thành phố *</label>
                                <input
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                                    value={formData.city || ''}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Địa chỉ *</label>
                            <input
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-black text-[#842A3B] uppercase tracking-widest mb-2">Mô tả</label>
                            <textarea
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm h-24 resize-none"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
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

export default HotelModal;