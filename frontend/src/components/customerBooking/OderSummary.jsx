import React from 'react';
import { Check } from 'lucide-react';

const fmt = (n) =>
    Number(n).toLocaleString('vi-VN') + '₫';

const toVN = (d) => d.toLocaleDateString('vi-VN');

export default function OrderSummary({ room, nights, services, selectedSvcs, roomTotal, svcsTotal, grandTotal, checkIn, checkOut }) {
    const selectedServices = services.filter(s => (selectedSvcs[s.id] ?? 0) > 0);

    return (
        <div className=" border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className=" text-xl font-semibold ">Tóm tắt đơn</h3>

            {/* Room */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span >Phòng {room.roomNumber}</span>
                    <span >{fmt(room.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span >× {nights} đêm</span>
                    <span >{fmt(roomTotal)}</span>
                </div>
            </div>

            {/* Services */}
            {selectedServices.length > 0 && (
                <>
                    <div className="border-t border-zinc-800" />
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest ">Dịch vụ thêm</p>
                        {selectedServices.map(s => {
                            const qty = selectedSvcs[s.id];
                            return (
                                <div key={s.id} className="flex justify-between text-sm">
                                    <span >{s.name} × {qty}</span>
                                    <span >{fmt(s.price * qty)}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Dates */}
            <div className="border-t border-zinc-800 pt-3 space-y-1">
                <div className="flex justify-between text-xs ">
                    <span>Check-in</span>
                    <span>{toVN(new Date(checkIn))}</span>
                </div>
                <div className="flex justify-between text-xs ">
                    <span>Check-out</span>
                    <span>{toVN(new Date(checkOut))}</span>
                </div>
            </div>

            {/* Grand total */}
            <div className="border-t border-zinc-700 pt-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium ">Tổng cộng</span>
                    <span className="text-2xl font-semibold text-yellow-400">{fmt(grandTotal)}</span>
                </div>
                {svcsTotal > 0 && (
                    <p className="text-xs  text-right mt-1">
                        (bao gồm {fmt(svcsTotal)} dịch vụ)
                    </p>
                )}
            </div>

            {/* Trust badges */}
            <div className="space-y-2 pt-2">
                {[{ icon: <Check />, text: ' Xác nhận ngay lập tức' }, { icon: <Check />, text: '✓ Hỗ trợ 24/7' }].map((badge, index) => (
                    <p key={index} className="text-xs flex items-center gap-1 justify-end text-right text-green-500">
                        {badge.icon} {badge.text}
                    </p>
                ))}
            </div>
        </div>
    );
}