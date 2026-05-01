import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/services/profileApi';
import { useToast } from '@/components/review/Toast';
import EditProfileForm from '@/components/profile/EditProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import BookingHistory from '@/components/profile/BookingHistory';
import { User, Lock, CalendarDays } from "lucide-react";


export default function ProfilePage() {
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToast();

    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    /*Load data*/
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, bRes, sRes] = await Promise.all([
                profileApi.getProfile(),
                profileApi.getBookings(),
                profileApi.getBookingSummary(),
            ]);
            setProfile(pRes.data);
            setBookings(bRes.data);
            setSummary(sRes.data);
        } catch {
            showToast('Không tải được dữ liệu. Vui lòng thử lại.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            {/*Header*/}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    {/*Avatar*/}
                    <div className="w-16 h-16 rounded-2xl bg-yellow-600/15 border border-yellow-600/25 flex items-center justify-center flex-shrink-0">
                        <span className=" text-2xl font-semibold text-yellow-500">
                            {profile?.fullName?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className=" text-3xl font-semibold mb-1">
                            {profile?.fullName}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-sm">{profile?.email}</span>
                            <span className="text-zinc-700">-</span>
                            <span className="text-zinc-500 text-sm">
                                {profile?.role}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[11px] uppercase tracking-widest ">Thành viên từ</p>
                    <p className="text-sm text-zinc-400">{profile?.createdAt}</p>
                </div>
            </div>

            {/*Summary stats*/}
            {summary && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                    {[
                        { label: 'Tổng', value: summary.total },
                        { label: 'Chờ xác nhận', value: summary.pending, color: 'text-amber-400' },
                        { label: 'Đã xác nhận', value: summary.confirmed, color: 'text-sky-400' },
                        { label: 'Đang ở', value: summary.checkedIn, color: 'text-emerald-400' },
                        { label: 'Hoàn thành', value: summary.completed, color: 'text-zinc-400' },
                        { label: 'Đã hủy', value: summary.cancelled, color: 'text-red-400' },
                    ].map(s => (
                        <div key={s.label}
                            className=" border border-zinc-800 rounded-xl p-4 text-center">
                            <div className={` text-2xl font-semibold ${s.color}`}>{s.value}</div>
                            <div className="text-[11px]  mt-0.5 uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/*Tabs*/}
            <div className="flex gap-1 mb-6 p-1 rounded-xl border border-zinc-800 w-fit">
                {[
                    { key: 'info', label: 'Thông tin cá nhân', icon: <User size={16} /> },
                    { key: 'password', label: 'Đổi mật khẩu', icon: <Lock size={16} /> },
                    {
                        key: 'bookings',
                        label: `Lịch sử đặt phòng${bookings.length ? ` (${bookings.length})` : ''}`,
                        icon: <CalendarDays size={16} />
                    },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === t.key
                            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/*Tab: Thông tin cá nhân*/}
            {activeTab === 'info' && (
                <EditProfileForm
                    profile={profile}
                    onSuccess={(updated) => {
                        setProfile(updated);
                        showToast('Cập nhật hồ sơ thành công!', 'success');
                    }}
                    onError={(msg) => showToast(msg, 'error')}
                />
            )}

            {/*Tab: Đổi mật khẩu*/}
            {activeTab === 'password' && (
                <ChangePasswordForm
                    onSuccess={() => showToast('Đổi mật khẩu thành công!', 'success')}
                    onError={(msg) => showToast(msg, 'error')}
                />
            )}

            {/*Tab: Lịch sử đặt phòng*/}
            {activeTab === 'bookings' && (
                <BookingHistory
                    bookings={bookings}
                    onReview={(booking) => navigate('/dashboard/reviews')}
                />
            )}

            <ToastContainer />
        </>
    );
}
