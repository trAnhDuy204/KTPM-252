import React, { useState, useEffect, useCallback } from 'react';
import { profileApi } from '@/services/profileApi';

const inputCls = (hasError) =>
    `w-full  border rounded-lg px-4 py-3 text-zinc-500 text-sm font-light outline-none
   placeholder:text-zinc-600 transition-all duration-200
   ${hasError
        ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
        : 'border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10'}`;

const LABEL = 'block text-[11px] font-medium tracking-widest uppercase mb-2';

export default function EditProfileForm({ profile, onSuccess, onError }) {
    const [form, setForm] = useState({ fullName: profile?.fullName || '', phone: profile?.phone || '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Họ tên là bắt buộc';
        else if (form.fullName.trim().length < 2) e.fullName = 'Tối thiểu 2 ký tự';
        if (form.phone && !/^\+?[0-9]{9,15}$/.test(form.phone))
            e.phone = 'Số điện thoại không hợp lệ';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            const { data } = await profileApi.updateProfile({
                fullName: form.fullName.trim(),
                phone: form.phone.trim() || null,
            });
            onSuccess(data);
        } catch (err) {
            onError(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-lg">
            <div className=" border border-zinc-800 rounded-2xl p-7">
                <h3 className=" text-xl font-semibold  mb-6">Thông tin cá nhân</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email (read-only) */}
                    <div>
                        <label className={LABEL}>Email <span className="normal-case font-light opacity-50">(không thể thay đổi)</span></label>
                        <input
                            readOnly value={profile?.email || ''}
                            className="w-full  border border-zinc-700/40 rounded-lg px-4 py-3 text-zinc-500 text-sm cursor-not-allowed" />
                    </div>

                    {/* Full name */}
                    <div>
                        <label className={LABEL}>Họ và tên</label>
                        <input
                            value={form.fullName}
                            onChange={e => { setForm(p => ({ ...p, fullName: e.target.value })); setErrors(p => ({ ...p, fullName: '' })); }}
                            placeholder="Nguyễn Văn A"
                            className={inputCls(errors.fullName)}
                        />
                        {errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className={LABEL}>Số điện thoại <span className="normal-case font-light opacity-50">(tùy chọn)</span></label>
                        <input
                            value={form.phone}
                            onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                            placeholder="0901234567"
                            className={inputCls(errors.phone)}
                        />
                        {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                    </div>

                    {/* Role (read-only) */}
                    <div>
                        <label className={LABEL}>Vai trò</label>
                        <div className="flex items-center gap-2 px-4 py-3 border border-zinc-700/40 rounded-lg">
                            <span className="text-zinc-500 text-sm">
                                {profile?.role}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs ">Thành viên từ {profile?.createdAt}</p>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500
                         text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/20">
                            {saving
                                ? <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                                : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}