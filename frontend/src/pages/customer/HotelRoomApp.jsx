import React, { useEffect, useState } from "react";

/* Reuse simple EmptyState */
function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <p className="text-sm text-zinc-500">{text}</p>
    </div>
  );
}

function handleBook(room) {
  const requestBody = {
    userId: 1,
    hotelId: room.hotelId,
    roomId: room.id,
    checkIn: "2026-04-25",
    checkOut: "2026-04-27",
    guestName: "Test User",
    guestPhone: "0123456789"
  };

  fetch("http://localhost:8080/api/public/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  })
    .then(async (res) => {
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Booking success:", data);

      // 👇 CALL PAYMENT HERE
      handlePay(data.id);

    })
    .catch((err) => {
      console.error("Booking error:", err.message);
      alert("Đặt phòng thất bại: " + err.message);
    });
}

function handlePay(bookingId) {
  fetch(`http://localhost:8080/api/public/payment/vnpay?bookingId=${bookingId}`)
    .then(res => res.text())
    .then(url => {
      window.location.href = url; // redirect to VNPAY
    })
    .catch(err => {
      console.error("Payment error:", err);
      alert("Không thể tạo thanh toán");
    });
}
/* Room Card (same style as ReviewPage cards) */
function RoomCard({ room }) {
  return (
    <div className="border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex items-center justify-between transition-colors duration-200 group">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center">
          🛏️
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-200">
            Room {room.roomNumber}
          </p>
          <p className="text-xs text-zinc-500">
            {room.roomTypeName}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Status: {room.status}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
          ${room.basePrice}
        </span>

        <button
          className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500
                     text-zinc-950 text-xs font-medium uppercase"
        >
          Xem Phòng
        </button>
        <button
          onClick={() => handleBook(room)}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium"
        >
          Đặt phòng
        </button>
      </div>
    </div>
  );
}

function HotelRoomsDisplay() {
  const [rooms, setRooms] = useState([]);
  const [originalRooms, setOriginalRooms] = useState([]);
  const [roomType, setRoomType] = useState("all");
  const [loading, setLoading] = useState(true);

  /* Fetch data */
  useEffect(() => {
    fetch("http://localhost:8080/api/public/rooms")
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setOriginalRooms(data);
      })
      .catch(err => console.log("Error:", err))
      .finally(() => setLoading(false));
  }, []);

  /* Sort */
  function AscDesc(order) {
    let sorted = [...originalRooms];

    if (order === "asc") {
      sorted.sort((a, b) => a.basePrice - b.basePrice);
    } else {
      sorted.sort((a, b) => b.basePrice - a.basePrice);
    }

    setRooms(sorted);
  }

  /* Filter */
  const filteredRooms =
    roomType === "all"
      ? rooms
      : rooms.filter(
          r => r.roomTypeName?.toLowerCase() === roomType.toLowerCase()
        );

  const grouped = rooms.reduce((acc, room) => {
    const hotel = room.hotelName;
    if (!acc[hotel]) acc[hotel] = [];
    acc[hotel].push(room);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: "60px", padding: "20px" }}>

      {/* Filter + Sort */}
      <div className="flex gap-3 mb-6">
        <select
          value={roomType}
          onChange={e => setRoomType(e.target.value)}
          className="border border-zinc-700 rounded-lg px-3 py-2 bg-zinc-900 text-sm"
        >
          <option value="all">All</option>
          <option value="single">Single</option>
          <option value="suite">Suite</option>
          <option value="luxury">Luxury</option>
        </select>

        <button
          onClick={() => AscDesc("asc")}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
        >
          Giá tăng
        </button>

        <button
          onClick={() => AscDesc("desc")}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
        >
          Giá giảm
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-zinc-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        /* Empty */
        <div className="border border-zinc-800 rounded-xl">
          <EmptyState text="Không có phòng nào." />
        </div>
      ) : (
        /* Rooms list */
        <div className="space-y-3">
          {Object.entries(grouped).map(([hotel, rooms]) => (
            <div key={hotel} className="mb-6">

              {/* Hotel title */}
              <h2 className="text-lg font-semibold text-yellow-400 mb-3">
                {hotel}
              </h2>

              {/* Rooms under that hotel */}
              <div className="space-y-3">
                {rooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
  
}


export default HotelRoomsDisplay;