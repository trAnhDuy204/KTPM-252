import axios from "axios";

const BASE = axios.create({
  baseURL: "http://localhost:8080/api/reception",
});

const API = axios.create({
  baseURL: "http://localhost:8080/api/reception/rooms",
});

export const getRooms = (hotelId, status) => {
  const params = {};
  if (hotelId) params.hotelId = hotelId;
  if (status) params.status = status;
  return API.get("", { params });
};

export const getRoom = (roomId) => API.get(`/${roomId}`);

export const createRoom = (data) => API.post("", data);

export const updateRoomStatus = (roomId, status) =>
  API.patch(`/${roomId}/status`, { status });

export const getHotels = () => BASE.get("/hotels");

export const getRoomTypes = (hotelId) =>
  BASE.get("/room-types", { params: { hotelId } });
