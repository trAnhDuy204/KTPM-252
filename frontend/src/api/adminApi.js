import axios from 'axios';

const API_URL = "http://localhost:8080/api/admin";

export const adminApi = {
    // --- QUẢN LÝ LOẠI PHÒNG (ROOM TYPES) ---
    getRoomTypes: () => axios.get(`${API_URL}/room-types`),

    saveRoomType(data) {
        if (data.id) {
            return axios.put(`${API_URL}/room-types/${data.id}`, data); 
        }
        return axios.post(`${API_URL}/room-types`, data); 
    },

    deleteRoomType: (id) => axios.delete(`${API_URL}/room-types/${id}`),

    // --- QUẢN LÝ PHÒNG (ROOMS) ---
    getAllRooms: () => axios.get(`${API_URL}/rooms`),

    saveRoom: (data) => {
        if (data.id) {
            return axios.put(`${API_URL}/rooms/${data.id}`, data);
        }
        return axios.post(`${API_URL}/rooms`, data);
    },

    deleteRoom: (id) => axios.delete(`${API_URL}/rooms/${id}`),

    searchRooms: (number) => axios.get(`${API_URL}/rooms/search?roomNumber=${number}`),

    // --- QUẢN LÝ KHÁCH SẠN (HOTELS) ---
    getUsers: () => axios.get(`${API_URL}/users`),

    saveUser: (data) => {
        if (data.id) {
            return axios.put(`${API_URL}/users/${data.id}`, data);
        }
        return axios.post(`${API_URL}/users`, data);
    },

    deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`),

    // HOTELS
    getHotels: () => axios.get(`${API_URL}/hotels`)

};