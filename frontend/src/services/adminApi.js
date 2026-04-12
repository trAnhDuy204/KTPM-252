import api from './api';

const API_URL = "http://localhost:8080/api/admin";

export const adminApi = {
    // QUẢN LÝ LOẠI PHÒNG
    getRoomTypes: () => api.get(`${API_URL}/room-types`),

    saveRoomType(data) {
        if (data.id) {
            return api.put(`${API_URL}/room-types/${data.id}`, data); 
        }
        return api.post(`${API_URL}/room-types`, data); 
    },

    deleteRoomType: (id) => api.delete(`${API_URL}/room-types/${id}`),

    // QUẢN LÝ PHÒNG
    getAllRooms: () => api.get(`${API_URL}/rooms`),

    saveRoom: (data) => {
        if (data.id) {
            return api.put(`${API_URL}/rooms/${data.id}`, data);
        }
        return api.post(`${API_URL}/rooms`, data);
    },

    deleteRoom: (id) => api.delete(`${API_URL}/rooms/${id}`),

    searchRooms: (number) => api.get(`${API_URL}/rooms/search?roomNumber=${number}`),

    // QUẢN LÝ KHÁCH SẠN
    getUsers: () => api.get(`${API_URL}/users`),

    saveUser: (data) => {
        if (data.id) {
            return api.put(`${API_URL}/users/${data.id}`, data);
        }
        return api.post(`${API_URL}/users`, data);
    },

    deleteUser: (id) => api.delete(`${API_URL}/users/${id}`),

    // HOTELS
    getHotels: () => api.get(`${API_URL}/hotels`)

};