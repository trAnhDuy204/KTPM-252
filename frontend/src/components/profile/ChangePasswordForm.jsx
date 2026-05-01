import React, { useState } from 'react';
import { profileApi } from '@/services/profileApi';
import { Eye, EyeClosed } from "lucide-react";


const inputCls = (hasError) =>
    `w-full  border rounded-lg px-4 py-3 text-zinc-500 text-sm font-light outline-none
   placeholder:text-zinc-600 transition-all duration-200
   ${hasError
        ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
        : 'border-zinc-700 focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10'}`;

const LABEL = 'block text-[11px] font-medium tracking-widest uppercase mb-2';

export default function ChangePasswordForm({ onSuccess, onError }) {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const getStrength = (pw) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^a-zA-Z0-9]/.test(pw)) s++;
        return s;
    };

    const validate = () => {
        const e = {};
        if (!form.currentPassword) e.currentPassword = 'Bắt buộc';
        if (!form.newPassword) e.newPassword = 'Bắt buộc';
        else if (form.newPassword.length < 8) e.newPassword = 'Tối thiểu 8 ký tự';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword))
            e.newPassword = 'Cần chữ hoa, chữ thường và số';
        if (!form.confirmPassword) e.confirmPassword = 'Bắt buộc';
        else if (form.confirmPassword !== form.newPassword) e.confirmPassword = 'Không khớp';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            await profileApi.changePassword(form);
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            onSuccess();
        } catch (err) {
            onError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const strength = getStrength(form.newPassword);
    const strengthCfg = [null,
        { label: 'Yếu', barColor: 'bg-red-500', textColor: 'text-red-400' },
        { label: 'Trung bình', barColor: 'bg-amber-500', textColor: 'text-amber-400' },
        { label: 'Khá', barColor: 'bg-yellow-500', textColor: 'text-yellow-400' },
        { label: 'Mạnh', barColor: 'bg-emerald-500', textColor: 'text-emerald-400' },
    ];

    return (
        <div className="max-w-lg">
            <div className=" border border-zinc-800 rounded-2xl p-7">
                <h3 className=" text-xl font-semibold  mb-2">Đổi mật khẩu</h3>
                <p className="text-sm text-zinc-500 mb-6">Mật khẩu mới phải khác mật khẩu hiện tại.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <PwInput
                        field="currentPassword"
                        label="Mật khẩu hiện tại"
                        placeholder=""
                        form={form}
                        errors={errors}
                        showPw={showPw}
                        set={set}
                        setShowPw={setShowPw}
                    />

                    {/* Divider */}
                    <div className="border-t border-zinc-800" />
                    <PwInput
                        field="newPassword"
                        label="Mật khẩu mới"
                        placeholder="Tối thiểu 8 ký tự"
                        form={form}
                        errors={errors}
                        showPw={showPw}
                        set={set}
                        setShowPw={setShowPw} 
                    />

                    {/* Strength meter */}
                    {form.newPassword && (
                        <div className="flex items-center gap-2 -mt-3">
                            <div className="flex gap-1 flex-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= i ? (strengthCfg[strength]?.barColor ?? 'bg-zinc-700') : 'bg-zinc-700'}`} />
                                ))}
                            </div>
                            <span className={`text-xs font-medium ${strengthCfg[strength]?.textColor ?? ''}`}>
                                {strengthCfg[strength]?.label}
                            </span>
                        </div>
                    )}

                    <PwInput
                        field="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        placeholder="Nhập lại mật khẩu mới"
                        form={form}
                        errors={errors}
                        showPw={showPw}
                        set={set}
                        setShowPw={setShowPw}
                    />

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500
                         text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/20">
                            {saving
                                ? <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                                : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PwInput({ field, label, placeholder, form, errors, showPw, set, setShowPw }) {
    return (
        <div>
            <label className={LABEL}>{label}</label>
            <div className="relative">
                <input
                    type={showPw[field] ? 'text' : 'password'}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                    className={inputCls(errors[field]) + ' pr-11'}
                />
                <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                >
                    {showPw[field] ? <EyeClosed /> : <Eye />}
                </button>
            </div>
            {errors[field] && <p className="mt-1.5 text-xs text-red-400">{errors[field]}</p>}
        </div>
    );
}