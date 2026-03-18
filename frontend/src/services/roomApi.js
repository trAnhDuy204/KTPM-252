import api from "./api";

export const getRooms = (hotelId, status) => {
  const params = {};
  if (hotelId) params.hotelId = hotelId;
  if (status) params.status = status;
  return api.get("/reception/rooms", { params });
};

export const getRoom = (roomId) => api.get(`/reception/rooms/${roomId}`);

export const createRoom = (data) => api.post("/reception/rooms", data);

export const updateRoomStatus = (roomId, status) =>
  api.patch(`/reception/rooms/${roomId}/status`, { status });

export const deleteRoom = (roomId) => api.delete(`/reception/rooms/${roomId}`);

export const getHotels = () => api.get("/reception/hotels");

export const getRoomTypes = (hotelId) =>
  api.get("/reception/room-types", { params: { hotelId } });
