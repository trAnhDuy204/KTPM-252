import api from './api';

export const profileApi = {
  getProfile:       ()     => api.get('/profile'),
  updateProfile:    (data) => api.put('/profile', data),
  changePassword:   (data) => api.put('/profile/password', data),
  getBookings:      ()     => api.get('/profile/bookings'),
  getBookingSummary:()     => api.get('/profile/bookings/summary'),
};