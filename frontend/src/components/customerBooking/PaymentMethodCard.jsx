import React from 'react';
import { Banknote, CreditCard } from 'lucide-react';

const PAYMENT_METHODS = [
    { icon: CreditCard, value: 'VNPAY', label: ' VNPay', desc: 'Chuyển khoản qua VNPay' },
];

export default function PaymentMethodCard({ method, setMethod }) {
    return (
        <div className=" border border-zinc-800 rounded-2xl p-6">
            <h2 className=" text-xl font-semibold mb-5">Phương thức thanh toán</h2>
            <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                    <label key={pm.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
              ${method === pm.value
                                ? 'border-yellow-600/50 '
                                : 'border-zinc-700/60 hover:border-zinc-600'}`}>
                        <input
                            type="radio" name="payMethod" value={pm.value}
                            checked={method === pm.value}
                            onChange={() => setMethod(pm.value)}
                            className="accent-yellow-500 w-4 h-4"
                        />
                        <div>
                            <p className="text-sm font-medium ">{pm.icon && <pm.icon size={25} className="mr-2 inline" />} {pm.label}</p>
                            <p className="text-xs">{pm.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}