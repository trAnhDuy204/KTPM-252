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


export const getRoomImages = (roomId) =>
  api.get(`/reception/rooms/${roomId}/images`);


export const uploadRoomImages = (roomId, files, caption) => {
  const formData = new FormData();

  files.forEach(file => {
    formData.append("files", file);
  });

  if (caption) {
    formData.append("caption", caption);
  }

  return api.post(
    `/reception/rooms/${roomId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const setPrimaryImage = (roomId, imageId) =>
  api.patch(`/reception/rooms/${roomId}/images/${imageId}/primary`);


export const updateImageCaption = (roomId, imageId, caption) =>
  api.patch(`/reception/rooms/${roomId}/images/${imageId}/caption`, {
    caption,
  });

export const deleteRoomImage = (roomId, imageId) =>
  api.delete(`/reception/rooms/${roomId}/images/${imageId}`);
