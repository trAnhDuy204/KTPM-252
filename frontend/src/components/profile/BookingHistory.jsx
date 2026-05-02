import React, { useState } from 'react';
import {  CalendarDays, Hotel, ArrowRight, Star } from "lucide-react";

const STATUS_CFG = {
    PENDING: { label: 'Chờ xác nhận', color: 'text-amber-400  bg-amber-500/10  border-amber-500/25' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'text-sky-400    bg-sky-500/10    border-sky-500/25' },
    CHECKED_IN: { label: 'Đang ở', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
    COMPLETED: { label: 'Hoàn thành', color: 'text-zinc-400   bg-zinc-500/10   border-zinc-500/25' },
    CANCELLED: { label: 'Đã hủy', color: 'text-red-400    bg-red-500/10    border-red-500/25' },
};

export default function BookingHistory({ bookings, onReview }) {
    const [filter, setFilter] = useState('ALL');

    const filtered = filter === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filter);

    return (
        <div>
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map(s => {
                    const cfg = STATUS_CFG[s] || { label: 'Tất cả', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25' };
                    const count = s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length;
                    return (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 ${filter === s
                                ? cfg.color + ' font-medium'
                                : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'}`}>
                            {s === 'ALL' ? 'Tất cả' : cfg.label}
                            {count > 0 && <span className="font-semibold">{count}</span>}
                        </button>
                    );
                })}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className=" border border-zinc-800 rounded-2xl flex flex-col items-center py-16 gap-3">
                    <CalendarDays size={48} />
                    <p className="text-sm text-zinc-500">Không có đặt phòng nào.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(b => <BookingCard key={b.id} booking={b} onReview={onReview} />)}
                </div>
            )}
        </div>
    );
}

/* Single booking card*/
function BookingCard({ booking, onReview }) {
    const cfg = STATUS_CFG[booking.status] || STATUS_CFG.PENDING;
    const nights = (() => {
        const [d1, m1, y1] = booking.checkIn.split('/');
        const [d2, m2, y2] = booking.checkOut.split('/');
        const diff = new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
        return Math.round(diff / 86400000);
    })();

    return (
        <div className=" border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4">

                {/* Left info */}
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl  border border-zinc-700 flex items-center justify-center text-xl flex-shrink-0">
                        <Hotel />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-medium  truncate">{booking.hotelName}</p>
                            {booking.hotelCity && (
                                <span className="text-xs ">- {booking.hotelCity}</span>
                            )}
                        </div>
                        <p className="text-xs  mb-2">
                            {booking.roomNumber}
                            {booking.roomTypeName && booking.roomTypeName !== '—' && ` - ${booking.roomTypeName}`}
                        </p>

                        {/* Dates */}
                        <div className="flex items-center gap-2 text-xs ">
                            <span className="px-2 py-0.5  rounded-md">{booking.checkIn}</span>
                            <ArrowRight size={16} />
                            <span className="px-2 py-0.5  rounded-md">{booking.checkOut}</span>
                            <span className="text-zinc-700">-</span>
                            <span>{nights} đêm</span>
                        </div>
                    </div>
                </div>

                {/* Right: price + status */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                    </span>
                    {booking.totalPrice && (
                        <p className=" text-lg font-semibold ">
                            {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
                        </p>
                    )}
                    {booking.canReview && (
                        <button onClick={() => onReview(booking)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-600/15 text-yellow-500 text-xs
                         border border-yellow-600/25 hover:bg-yellow-600/25 transition-colors">
                            <Star size={16} /> Đánh giá
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-[11px] ">Mã đặt phòng #{booking.id}</span>
                <span className="text-[11px] ">Đặt lúc {booking.createdAt}</span>
            </div>
        </div>
    );
}