import React from 'react';
import {  MoonStar } from 'lucide-react';

const toVN = (d) => d.toLocaleDateString('vi-VN');

export default function DatePickerCard({ checkIn, setCheckIn, checkOut, setCheckOut, nights }) {
    const todayISO = new Date().toLocaleDateString('sv-SE');

    return (
        <div className=" border border-zinc-800 rounded-2xl p-6">
            <h2 className=" text-xl font-semibold  mb-5">Chọn ngày lưu trú</h2>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-medium tracking-widest uppercase mb-2">
                        Check-in
                    </label>
                    <input
                        type="date"
                        min={todayISO}
                        value={checkIn}
                        onChange={e => {
                            setCheckIn(e.target.value);
                            if (e.target.value >= checkOut) {
                                const next = new Date(e.target.value);
                                next.setDate(next.getDate() + 1);
                                setCheckOut(next.toLocaleDateString('sv-SE'));
                            }
                        }}
                        className="w-full text-zinc-950 border border-zinc-700 rounded-lg px-4 py-3  text-sm outline-none focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-medium tracking-widest uppercase mb-2">
                        Check-out
                    </label>
                    <input
                        type="date"
                        min={checkIn}
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        className="w-full text-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-yellow-600/70 focus:ring-2 focus:ring-yellow-500/10 transition-all"
                    />
                </div>
            </div>

            {/* Nights badge */}
            <div className="mt-4 flex items-center gap-3 px-4 py-3 border border-zinc-700/40 rounded-xl">
                <span className="text-xl"><MoonStar size={30} /></span>
                <div>
                    <p className="text-sm font-medium ">{nights} đêm lưu trú</p>
                    <p className="text-xs ">
                        {toVN(new Date(checkIn))} → {toVN(new Date(checkOut))}
                    </p>
                </div>
            </div>
        </div>
    );
}