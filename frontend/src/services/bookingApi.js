import api from "./api";

export const checkIn = (data) => api.post("/reception/bookings/check-in", data);

export const checkOut = (bookingId) =>
  api.post(`/reception/bookings/${bookingId}/check-out`);

export const cancelBooking = (bookingId) =>
  api.post(`/reception/bookings/${bookingId}/cancel`);

export const getBookings = (hotelId, status) => {
  const params = {};
  if (hotelId) params.hotelId = hotelId;
  if (status) params.status = status;
  return api.get("/reception/bookings", { params });
};

export const getBooking = (bookingId) =>
  api.get(`/reception/bookings/${bookingId}`);

export const createBooking = (data) =>
  api.post("/reception/bookings", data);

export const confirmBooking = (bookingId) =>
  api.post(`/reception/bookings/${bookingId}/confirm`);
