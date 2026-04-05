import api from './api';

export const reviewApi = {
  // Gửi đánh giá mới
  create: (data) => api.post('/reviews', data),

  // Danh sách booking có thể đánh giá
  getReviewableBookings: () => api.get('/reviews/my-bookings'),

  // Xem lại các review của mình
  getMyReviews: () => api.get('/reviews/my-reviews'),

  // Review của một khách sạn
  getHotelReviews: (hotelId) => api.get(`/reviews/hotel/${hotelId}`),

  // Điểm trung bình khách sạn
  getHotelRating: (hotelId) => api.get(`/reviews/hotel/${hotelId}/rating`),

  // Xóa review
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};