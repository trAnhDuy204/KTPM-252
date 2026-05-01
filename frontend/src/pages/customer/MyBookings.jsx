import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:8080/api/public/bookings?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.log(err));
  }, [user]);

  const handleCancel = (id) => {
    fetch(`http://localhost:8080/api/public/bookings/${id}/cancel`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(() => {
        // refresh list
        setBookings(prev => prev.filter(b => b.id !== id));
      })
      .catch(err => alert("Cancel failed"));
  };

  const handleEdit = (booking) => {
  const newCheckIn = prompt("New check-in (YYYY-MM-DD):", booking.checkIn);
  const newCheckOut = prompt("New check-out (YYYY-MM-DD):", booking.checkOut);

  if (!newCheckIn || !newCheckOut) return;

  fetch(`http://localhost:8080/api/public/bookings/${booking.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      checkIn: newCheckIn,
      checkOut: newCheckOut
    })
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    })
    .then(() => {
      alert("Updated!");

      // 🔥 refresh list (better than reload)
      setBookings(prev =>
        prev.map(b =>
          b.id === booking.id
            ? { ...b, checkIn: newCheckIn, checkOut: newCheckOut }
            : b
        )
      );
    })
    .catch(err => alert("Update failed: " + err.message));
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        bookings.map(b => (
          <div key={b.id} style={{
            border: "1px solid #444",
            margin: "10px 0",
            padding: "10px",
            borderRadius: "8px"
          }}>
            <p>Room: {b.roomNumber}</p>
            <p>{b.checkIn} → {b.checkOut}</p>
            <p>Status: {b.status}</p>

            {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
            <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleEdit(b)}>
                Edit
                </button>

                <button onClick={() => handleCancel(b.id)}>
                Cancel
                </button>
            </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;