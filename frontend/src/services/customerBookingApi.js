import api from './api';

export const customerBookingApi = {
  // Tạo đặt phòng mới
  create: (data) => api.post('/public/bookings', data),
 
  // Lấy thông tin 1 booking
  getById: (id) => api.get(`/public/bookings/${id}`),
 
  // Lấy danh sách dịch vụ của khách sạn
  getServices: (hotelId) => api.get(`/public/services?hotelId=${hotelId}`),
 
  // Tạo payment (trả về URL VNPay)
  createPayment: (data) =>
    api.post('/public/payment', data, { responseType: 'text' }),
 
  // Tạo URL VNPay
  createVnpay: (bookingId) =>
    api.get(`/public/payment/vnpay?bookingId=${bookingId}`, { responseType: 'text' }),
 
  // Lưu service_usages
  addServiceUsages: (bookingId, services) =>
    api.post(`/public/bookings/${bookingId}/services`, { services }),
};
 
export default customerBookingApi;