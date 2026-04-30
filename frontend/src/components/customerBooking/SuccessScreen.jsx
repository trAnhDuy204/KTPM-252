import React from 'react';

const fmt = (n) =>
    Number(n).toLocaleString('vi-VN') + '₫';

export default function SuccessScreen({ booking, room, grandTotal, navigate }) {
    
    return (
        <div className="max-w-lg mx-auto mt-16 px-6 text-center">
            {/* Animated checkmark */}
            <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
                    <span className="text-4xl">✓</span>
                </div>
            </div>

            <h2 className="font-display text-3xl font-semibold  mb-2">Đặt phòng thành công!</h2>
            <p className=" text-sm mb-8">
                Cảm ơn bạn đã chọn {room.hotelName}. Chúng tôi sẽ liên hệ xác nhận sớm nhất.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left space-y-3 mb-8">
                <Row label="Mã đặt phòng" value={`#${booking?.id}`} />
                <Row label="Khách sạn" value={room.hotelName} />
                <Row label="Phòng" value={`${room.roomNumber} - ${room.roomTypeName}`} />
                <Row label="Tổng tiền" value={fmt(grandTotal)} />
                <Row label="Trạng thái" value="Chờ xác nhận" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 rounded-xl border border-zinc-700  text-sm hover:border-zinc-500 transition-colors">
                    Về Dashboard
                </button>
                <button onClick={() => navigate('/profile', { state: { tab: 'bookings' } })}
                    className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all">
                    Xem lịch sử đặt phòng
                </button>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between items-baseline text-sm">
            <span className="">{label}</span>
            <span className=" font-medium text-right ml-4">{value}</span>
        </div>
    );
}