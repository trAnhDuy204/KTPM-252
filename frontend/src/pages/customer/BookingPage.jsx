import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { customerBookingApi } from '@/services/customerBookingApi';
import { useToast } from '@/components/review/Toast';
import RoomInfoCard from "@/components/customerBooking/RoomInfoCard";
import DatePickerCard from "@/components/customerBooking/DatePickerCard";
import ServicesCard from "@/components/customerBooking/ServiceCard";
import PaymentMethodCard from "@/components/customerBooking/PaymentMethodCard";
import OrderSummary from '@/components/customerBooking/OderSummary';
import ConfirmScreen from '@/components/customerBooking/ConfirmScreen';
import SuccessScreen from '@/components/customerBooking/SuccessScreen';
import { Frown, MoveRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const toISO = (d) => d.toLocaleDateString('sv-SE');

const diffDays = (from, to) =>
    Math.max(1, Math.round((new Date(to) - new Date(from)) / 86_400_000));

export default function BookingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToast();

    const today = new Date();
    const tomorrow = addDays(today, 1);

    const [checkIn, setCheckIn] = useState(toISO(tomorrow));
    const [checkOut, setCheckOut] = useState(toISO(addDays(tomorrow, 2)));
    const [payMethod, setPayMethod] = useState('CASH');

    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [selectedSvcs, setSelectedSvcs] = useState({});

    const [step, setStep] = useState('form');
    const [booking, setBooking] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // room truyền qua navigate state
    const room = location.state?.room || booking?.room;

    //redirect nếu không có room
    useEffect(() => {
        if (!room) navigate('/rooms', { replace: true });
    }, [room, navigate]);

    //fetch dịch vụ của khách sạn
    useEffect(() => {
        if (!room?.hotelId) return;
        setServicesLoading(true);
        customerBookingApi.getServices(room.hotelId)
            .then(r => setServices(r.data ?? []))
            .catch(() => setServices([]))
            .finally(() => setServicesLoading(false));
    }, [room?.hotelId]);

    // tính tiền
    const nights = useMemo(
        () => diffDays(checkIn, checkOut),
        [checkIn, checkOut]
    );

    const roomTotal = useMemo(
        () => (room?.basePrice ?? 0) * nights,
        [room, nights]
    );

    const svcsTotal = useMemo(() =>
        services.reduce((sum, svc) => {
            const qty = selectedSvcs[svc.id] ?? 0;
            return sum + svc.price * qty;
        }, 0),
        [services, selectedSvcs]
    );

    const grandTotal = roomTotal + svcsTotal;

    // toggle / qty dịch vụ
    const toggleSvc = (id) =>
        setSelectedSvcs(prev =>
            prev[id] ? (() => { const n = { ...prev }; delete n[id]; return n; })()
                : { ...prev, [id]: 1 }
        );

    const setSvcQty = (id, qty) => {
        if (qty <= 0) {
            setSelectedSvcs(prev => { const n = { ...prev }; delete n[id]; return n; });
        } else {
            setSelectedSvcs(prev => ({ ...prev, [id]: qty }));
        }
    };

    // validation
    const validate = () => {
        const ci = new Date(checkIn);
        const co = new Date(checkOut);
        if (ci < today) return 'Ngày check-in phải từ hôm nay trở đi';
        if (co <= ci) return 'Ngày check-out phải sau check-in';
        return null;
    };

    // submit booking
    const handleSubmit = async () => {
        const err = validate();
        if (err) { showToast(err, 'error'); return; }
        setStep('processing');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            // Tạo booking
            const { data: bk } = await customerBookingApi.create({
                userId: user.id,
                hotelId: room.hotelId,
                roomId: room.id,
                checkIn,
                checkOut,
                guestName: user.fullName,
                guestPhone: user.phone,
            });
            setBooking(bk);

            // Lưu service_usages nếu có chọn
            const svcPayload = Object.entries(selectedSvcs)
                .filter(([, qty]) => qty > 0)
                .map(([id, quantity]) => ({
                    serviceId: Number(id),
                    quantity,
                    totalPrice: (services.find(s => s.id === Number(id))?.price ?? 0) * quantity,
                }));

            if (svcPayload.length > 0) {
                await customerBookingApi.addServiceUsages(bk.id, svcPayload);
            }

            // Thanh toán
            if (payMethod === 'VNPAY') {

                const { data: url } = await customerBookingApi.createVnpay(bk.id);
                window.location.href = url;
                return;
            }

            // CASH / CARD
            await customerBookingApi.createPayment({
                bookingId: bk.id,
                amount: grandTotal,
                paymentMethod: payMethod,
                status: payMethod === 'CASH' ? 'PENDING' : 'PAID',
            });

            setStep('done');
        } catch (e) {
            setErrorMsg(e.response?.data?.message ?? e.message ?? 'Đặt phòng thất bại');
            setStep('error');
        }
    };

    if (!room) return null;

    return (
        <div>
            <ToastContainer />

            {/* Navbar */}
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 transition-colors text-sm">
                ← Quay lại
            </button>

            {/*Processing overlay*/}
            {step === 'processing' && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4">
                    <span className="w-12 h-12 border-4 border-zinc-700 border-t-yellow-500 rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Đang xử lý đặt phòng...</p>
                </div>
            )}

            {/* Done screen */}
            {step === 'done' && <SuccessScreen booking={booking} room={room} grandTotal={grandTotal} navigate={navigate} />}

            {/* Error screen */}
            {step === 'error' && (
                <div className="max-w-md mx-auto mt-24 text-center px-6">
                    <div className="text-5xl mb-4"><Frown /></div>
                    <h2 className="font-display text-2xl font-semibold text-red-400 mb-2">Đặt phòng thất bại</h2>
                    <p className="text-zinc-500 text-sm mb-8">{errorMsg}</p>
                    <button onClick={() => setStep('form')}
                        className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-sm font-medium uppercase tracking-widest transition-all">
                        Thử lại
                    </button>
                </div>
            )}

            {/* Main form */}
            {(step === 'form' || step === 'confirm') && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {step === 'form' ? (
                            <>
                                {/* Room info */}
                                <RoomInfoCard room={room} />

                                {/*Date picker */}
                                <DatePickerCard
                                    checkIn={checkIn} setCheckIn={setCheckIn}
                                    checkOut={checkOut} setCheckOut={setCheckOut}
                                    nights={nights}
                                />

                                {/*Services */}
                                <ServicesCard
                                    services={services}
                                    loading={servicesLoading}
                                    selected={selectedSvcs}
                                    onToggle={toggleSvc}
                                    onQtyChange={setSvcQty}
                                />

                                {/* Payment method */}
                                <PaymentMethodCard method={payMethod} setMethod={setPayMethod} />

                                <button
                                    onClick={() => {
                                        const err = validate();
                                        if (err) { showToast(err, 'error'); return; }
                                        setStep('confirm');
                                    }}
                                    className="w-full py-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 font-medium text-sm tracking-widest uppercase transition-all hover:shadow-xl hover:shadow-yellow-500/20 flex items-center justify-center gap-2"
                                >
                                    <span>Tiếp tục</span>
                                    <MoveRight className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            /* Confirm screen */
                            <ConfirmScreen
                                room={room} checkIn={checkIn} checkOut={checkOut} nights={nights}
                                services={services} selectedSvcs={selectedSvcs}
                                payMethod={payMethod} roomTotal={roomTotal} svcsTotal={svcsTotal}
                                grandTotal={grandTotal}
                                onBack={() => setStep('form')}
                                onConfirm={handleSubmit}
                            />
                        )}
                    </div>

                    {/* Order summary */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <OrderSummary
                            room={room} nights={nights}
                            services={services} selectedSvcs={selectedSvcs}
                            roomTotal={roomTotal} svcsTotal={svcsTotal} grandTotal={grandTotal}
                            checkIn={checkIn} checkOut={checkOut}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}