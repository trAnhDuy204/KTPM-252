import React from 'react';
import {  MoveRight, MoveLeft } from 'lucide-react';
import { Banknote, CreditCard } from 'lucide-react';

const fmt = (n) =>
    Number(n).toLocaleString('vi-VN') + '₫';

const toVN = (d) => d.toLocaleDateString('vi-VN');

const PAYMENT_METHODS = [
    { icon: Banknote, value: 'CASH', label: ' Tiền mặt', desc: 'Thanh toán tại quầy lúc check-in' },
    { icon: CreditCard, value: 'VNPAY', label: ' VNPay', desc: 'Chuyển khoản qua VNPay' },
];

export default function ConfirmScreen({ room, checkIn, checkOut, nights, services, selectedSvcs,
    payMethod, roomTotal, svcsTotal, grandTotal, onBack, onConfirm }) {
    const selectedSvcsArr = services.filter(s => (selectedSvcs[s.id] ?? 0) > 0);
    const pmLabel = PAYMENT_METHODS.find(p => p.value === payMethod)?.label;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="space-y-6">
            <div className=" border border-zinc-800 rounded-2xl p-6 space-y-5">
                <h2 className=" text-xl font-semibold ">Xác nhận thông tin đặt phòng</h2>

                {/* Guest info */}
                <Section title="Thông tin khách hàng">
                    <Row label="Họ tên" value={user.fullName ?? '—'} />
                    <Row label="Email" value={user.email ?? '—'} />
                    <Row label="SĐT" value={user.phone ?? '—'} />
                </Section>

                {/* Room */}
                <Section title="Phòng">
                    <Row label="Khách sạn" value={room.hotelName} />
                    <Row label="Số phòng" value={`Phòng ${room.roomNumber} - ${room.roomTypeName}`} />
                    <Row label="Check-in" value={toVN(new Date(checkIn))} />
                    <Row label="Check-out" value={toVN(new Date(checkOut))} />
                    <Row label="Số đêm" value={`${nights} đêm`} />
                </Section>

                {/* Services */}
                {selectedSvcsArr.length > 0 && (
                    <Section title="Dịch vụ thêm">
                        {selectedSvcsArr.map(s => (
                            <Row key={s.id}
                                label={`${s.name} × ${selectedSvcs[s.id]}`}
                                value={fmt(s.price * selectedSvcs[s.id])} />
                        ))}
                    </Section>
                )}

                {/* Payment */}
                <Section title="Thanh toán">
                    <Row label="Phương thức" value={pmLabel} />
                    <Row label="Tiền phòng" value={fmt(roomTotal)} />
                    {svcsTotal > 0 && <Row label="Dịch vụ" value={fmt(svcsTotal)} />}
                    <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800 mt-2">
                        <span className="text-sm font-medium ">Tổng cộng</span>
                        <span className=" text-2xl font-semibold text-yellow-400">{fmt(grandTotal)}</span>
                    </div>
                </Section>
            </div>

            <div className="flex gap-3">
                {/* Nút quay lại */}
                <button
                    onClick={onBack}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-sm hover:border-zinc-500  transition-colors flex items-center justify-center gap-2"
                >
                    <MoveLeft className="w-4 h-4" />
                    <span>Quay lại chỉnh sửa</span>
                </button>

                {/* Nút confirm */}
                <button
                    onClick={onConfirm}
                    className="flex-1 py-3.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium tracking-widest uppercase transition-all hover:shadow-xl hover:shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                    {payMethod === 'VNPAY' ? (
                        <>
                            <span>Thanh toán VNPay</span>
                            <MoveRight className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            <span>Xác nhận đặt phòng</span>
                            <MoveRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase  mb-3">{title}</p>
            <div className="space-y-2">{children}</div>
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