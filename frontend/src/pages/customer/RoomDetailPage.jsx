import {
    Hotel, MapPinHouse, BedSingle, User, DoorClosed, CheckCircle,
    Wifi, Snowflake, Tv, Bath, Coffee, Sparkles, ZoomIn,
    ChevronLeft, ChevronRight, X
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomDetailReview from '@/components/review/RoomDetailReview';

const STATUS_CFG = {
    AVAILABLE: { label: 'Còn trống', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    RESERVED: { label: 'Đã được đặt trước', color: 'text-blue-400   bg-blue-500/10   border-blue-500/30' },
    OCCUPIED: { label: 'Đang dùng', color: 'text-red-400    bg-red-500/10    border-red-500/30' },
    CLEANING: { label: 'Đang dọn', color: 'text-sky-400    bg-sky-500/10    border-sky-500/30' },
    MAINTENANCE: { label: 'Bảo trì', color: 'text-amber-400  bg-amber-500/10  border-amber-500/30' },
};

const amenities = [
    { icon: Wifi, label: 'WiFi miễn phí' },
    { icon: Snowflake, label: 'Điều hòa' },
    { icon: Tv, label: 'TV màn hình phẳng' },
    { icon: Bath, label: 'Phòng tắm riêng' },
    { icon: Coffee, label: 'Máy pha cà phê' },
    { icon: Sparkles, label: 'Dọn phòng hàng ngày' },
];

const fmt = (n) => Number(n).toLocaleString('vi-VN') + '₫';

export default function RoomDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const [activeIdx, setActiveIdx] = useState(0);
    const [lightbox, setLightbox] = useState(false);


    const handleKey = useCallback((e) => {
        if (!lightbox) return;
        if (e.key === 'ArrowRight')
            setActiveIdx(i => (i + 1) % (room?.images?.length ?? 1));
        if (e.key === 'ArrowLeft')
            setActiveIdx(i => (i - 1 + (room?.images?.length ?? 1)) % (room?.images?.length ?? 1));
        if (e.key === 'Escape') setLightbox(false);
    }, [lightbox, room]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);


    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8080/api/public/rooms/${id}`)
            .then(r => {
                if (!r.ok) throw new Error('Phòng không tồn tại');
                return r.json();
            })
            .then(data => {
                setRoom(data);
                // Đặt primary image làm ảnh active đầu tiên
                const primaryIdx = data.images?.findIndex(img => img.isPrimary) ?? 0;
                setActiveIdx(Math.max(0, primaryIdx));
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBook = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { navigate('/login'); return; }
        navigate('/dashboard/booking', { state: { room } });
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="w-10 h-10 border-4 border-zinc-700 border-t-yellow-500 rounded-full animate-spin" />
        </div>
    );


    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-zinc-400">{error}</p>
            <button onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors">
                Quay lại
            </button>
        </div>
    );

    const images = room.images ?? [];
    const hasImages = images.length > 0;
    const activeImg = images[activeIdx];
    const statusCfg = STATUS_CFG[room.status] ?? STATUS_CFG.AVAILABLE;
    const isBookable = room.status === 'AVAILABLE';

    return (
        <div>
            {/* ── Navbar ── */}
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 transition-colors text-sm">
                ← Quay lại
            </button>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

                    {/* ══ LEFT: Gallery + Info ══ */}
                    <div className="space-y-8">

                        {/* ── Gallery ── */}
                        {hasImages ? (
                            <div className="space-y-3">
                                {/* Main image */}
                                <div
                                    className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800 cursor-zoom-in group"
                                    onClick={() => setLightbox(true)}
                                >
                                    <img
                                        src={activeImg?.url}
                                        alt={activeImg?.caption || `Phòng ${room.roomNumber}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    />

                                    {/* Caption overlay */}
                                    {activeImg?.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
                                            <p className="text-sm ">{activeImg.caption}</p>
                                        </div>
                                    )}

                                    {/* Counter badge */}
                                    <div className="absolute top-3 right-3 px-2.5 py-1  backdrop-blur-sm rounded-full text-xs ">
                                        {activeIdx + 1} / {images.length}
                                    </div>

                                    {/* Zoom hint */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 backdrop-blur-sm rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn className="w-3.5 h-3.5" />
                                        <span>Phóng to</span>
                                    </div>

                                    {/* Prev/Next arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveIdx(i => (i - 1 + images.length) % images.length); }}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full  hover:bg-gray-300  flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronLeft />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveIdx(i => (i + 1) % images.length); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full  hover:bg-gray-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronRight />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {images.map((img, i) => (
                                            <button
                                                key={img.id}
                                                onClick={() => setActiveIdx(i)}
                                                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-150 ${i === activeIdx
                                                    ? 'border-yellow-500 opacity-100'
                                                    : 'border-transparent opacity-50 hover:opacity-80'
                                                    }`}
                                            >
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* No images placeholder */
                            <div className="aspect-[16/10] rounded-2xl border border-zinc-800 flex flex-col items-center justify-center gap-3">
                                <span className="text-5xl opacity-20"><Hotel size={60} /></span>
                                <p className="text-sm">Chưa có ảnh phòng</p>
                            </div>
                        )}

                        {/* ── Room header ── */}
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <h1 className=" text-3xl font-semibold ">
                                        Phòng {room.roomNumber}
                                    </h1>
                                    <p className=" text-sm mt-1">
                                        {room.roomTypeName}
                                        {room.hotelName && (
                                            <span className="ml-2 "> - {room.hotelName}</span>
                                        )}
                                    </p>
                                </div>
                                <span className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border ${statusCfg.color}`}>
                                    {statusCfg.label}
                                </span>
                            </div>

                            {/* Hotel location */}
                            {room.hotelCity && (
                                <p className="flex items-center gap-1.5 text-sm">
                                    <MapPinHouse /> {room.hotelCity}
                                    {room.hotelAddress && <span > - {room.hotelAddress}</span>}
                                </p>
                            )}
                        </div>

                        {/* ── Description ── */}
                        {room.description && (
                            <div className=" border border-zinc-800 rounded-2xl p-6">
                                <h3 className=" text-lg font-semibold mb-3">Mô tả phòng</h3>
                                <p className=" text-sm leading-relaxed">{room.description}</p>
                            </div>
                        )}

                        {/* ── Room details ── */}
                        <div className=" border border-zinc-800 rounded-2xl p-6">
                            <h3 className=" text-lg font-semibold mb-4">Thông tin phòng</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { icon: BedSingle, label: 'Loại phòng', value: room.roomTypeName },
                                    { icon: User, label: 'Sức chứa', value: room.capacity ? `${room.capacity} khách` : '—' },
                                    { icon: Hotel, label: 'Khách sạn', value: room.hotelName },
                                    { icon: MapPinHouse, label: 'Thành phố', value: room.hotelCity },
                                    { icon: DoorClosed, label: 'Số phòng', value: room.roomNumber },
                                    { icon: CheckCircle, label: 'Trạng thái', value: statusCfg.label },
                                ].filter(i => i.value).map(item => (
                                    <div key={item.label} className="flex items-start gap-3">
                                        <span className="text-lg flex-shrink-0 mt-0.5">
                                            <item.icon />
                                        </span>
                                        <div>
                                            <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5">{item.label}</p>
                                            <p className="text-sm ">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Amenities (static) ── */}
                        <div className="border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Tiện nghi cơ bản</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {amenities.map(item => (
                                    <div key={item.label} className="flex items-center gap-2 text-sm">
                                        <span className="text-base">
                                            <item.icon />
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Đánh giá khách hàng ── */}
                        {room.hotelId && (
                            <RoomDetailReview
                                hotelId={room.hotelId}
                                hotelName={room.hotelName}
                            />
                        )}
                    </div>

                    {/* ══ RIGHT: Booking sidebar ══ */}
                    <div className="lg:sticky lg:top-24 h-fit space-y-4">

                        {/* Price card */}
                        <div className=" border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className=" text-3xl font-semibold text-yellow-400">
                                    {room.basePrice ? fmt(room.basePrice) : '—'}
                                </span>
                                <span className=" text-sm">/ đêm</span>
                            </div>
                            <p className="text-xs  mb-5">Chưa bao gồm thuế và phí dịch vụ</p>

                            {/* Status */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-5 ${statusCfg.color}`}>
                                <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                                <span className="text-sm font-medium">{statusCfg.label}</span>
                            </div>

                            <button
                                onClick={handleBook}
                                disabled={!isBookable}
                                className="w-full py-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-zinc-950 font-medium text-sm tracking-widest uppercase transition-all hover:shadow-xl hover:shadow-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isBookable ? 'Đặt phòng ngay' : 'Phòng không khả dụng'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════ Lightbox ════ */}
            {lightbox && hasImages && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={() => setLightbox(false)}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="text-sm text-zinc-400">
                            {activeIdx + 1} / {images.length}
                        </span>
                        <span className="text-zinc-500 text-sm">
                            {activeImg?.caption}
                        </span>
                        <button
                            onClick={() => setLightbox(false)}
                            className="text-zinc-400 hover:text-zinc-100 text-2xl transition-colors"
                        >
                            <X />
                        </button>
                    </div>

                    {/* Main image */}
                    <div className="flex-1 flex items-center justify-center px-16 relative" onClick={e => e.stopPropagation()}>
                        <img
                            src={activeImg?.url}
                            alt={activeImg?.caption || ''}
                            className="max-h-full max-w-full object-contain rounded-xl"
                            style={{ maxHeight: 'calc(100vh - 160px)' }}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveIdx(i => (i - 1 + images.length) % images.length)}
                                    className="absolute left-4 w-12 h-12 rounded-full bg-gray-800 hover:bg-black/90 text-zinc-200 text-xl flex items-center justify-center transition-all"
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    onClick={() => setActiveIdx(i => (i + 1) % images.length)}
                                    className="absolute right-4 w-12 h-12 rounded-full bg-gray-800 hover:bg-black/90 text-zinc-200 text-xl flex items-center justify-center transition-all"
                                >
                                    <ChevronRight />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    <div className="flex gap-2 px-6 py-4 overflow-x-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {images.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => setActiveIdx(i)}
                                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeIdx ? 'border-yellow-500' : 'border-transparent opacity-50 hover:opacity-80'
                                    }`}
                            >
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}