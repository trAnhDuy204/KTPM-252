import React from 'react';
import {  Wrench, Check } from 'lucide-react';

const fmt = (n) =>
    Number(n).toLocaleString('vi-VN') + '₫';

export default function ServicesCard({ services, loading, selected, onToggle, onQtyChange }) {
    return (
        <div className=" border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className=" text-xl font-semibold ">Dịch vụ thêm</h2>
                <span className="text-xs  uppercase tracking-wider">Tùy chọn</span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-14  rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : services.length === 0 ? (
                <div className="flex items-center gap-3 px-4 py-3 border border-zinc-700/30 rounded-xl">
                    <span className="text-lg opacity-40"><Wrench /></span>
                    <p className="text-sm">Khách sạn này không có dịch vụ thêm.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {services.map(svc => {
                        const qty = selected[svc.id] ?? 0;
                        const checked = qty > 0;
                        return (
                            <div key={svc.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer group
                  ${checked
                                        ? 'border-yellow-600/40 '
                                        : 'border-zinc-700/60 hover:border-zinc-600'}`}
                                onClick={() => onToggle(svc.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Checkbox */}
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${checked ? 'border-yellow-500 bg-yellow-500' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                                        {checked && <span className=" text-xs font-bold leading-none"><Check size={15} /></span>}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{svc.name}</p>
                                        <p className="text-xs text-yellow-500">{fmt(svc.price)} / lần</p>
                                    </div>
                                </div>

                                {/* Qty stepper */}
                                {checked && (
                                    <div className="flex items-center gap-2 ml-4 flex-shrink-0"
                                        onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => onQtyChange(svc.id, qty - 1)}
                                            className="w-7 h-7 rounded-lg border border-zinc-600 hover:bg-zinc-600  text-sm font-bold transition-colors flex items-center justify-center">
                                            −
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium 0">{qty}</span>
                                        <button
                                            onClick={() => onQtyChange(svc.id, qty + 1)}
                                            className="w-7 h-7 rounded-lg border border-zinc-600 hover:bg-zinc-600  text-sm font-bold transition-colors flex items-center justify-center">
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}