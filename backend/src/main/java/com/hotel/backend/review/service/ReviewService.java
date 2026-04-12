package com.hotel.backend.review.service;

import com.hotel.backend.review.dto.ReviewDto;
import com.hotel.backend.review.entity.Review;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.review.exception.ResourceNotFoundException;
import com.hotel.backend.review.exception.ReviewException;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.review.respository.ReviewRepository;
import com.hotel.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    //Tạo đánh giá mới

    @Transactional
    public ReviewDto.Response createReview(Integer userId, ReviewDto.CreateRequest request) {

        // Booking tồn tại và thuộc về user 
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đặt phòng #" + request.getBookingId()));

        if (!booking.getUserId().equals(userId)) {
            throw new ReviewException("Bạn không có quyền đánh giá đặt phòng này");
        }

        // Booking phải có trạng thái COMPLETED
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ReviewException(
                    "Chỉ có thể đánh giá sau khi hoàn thành kỳ nghỉ (trạng thái: COMPLETED)");
        }

        // Chưa đánh giá booking này chưa?
        if (reviewRepository.existsByBookingIdAndUserId(request.getBookingId(), userId)) {
            throw new ReviewException("Bạn đã đánh giá đặt phòng này rồi");
        }

        // Lưu đánh giá
        Review review = Review.builder()
                .bookingId(request.getBookingId())
                .userId(userId)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        if (review == null) {
            throw new RuntimeException("Review not found");
        }
        Review saved = reviewRepository.save(review);
        return toResponse(saved, userId);
    }

    // Lấy danh sách booking đã COMPLETED của user
    @Transactional(readOnly = true)
    public List<ReviewDto.ReviewableBooking> getReviewableBookings(Integer userId) {
        return bookingRepository
                .findByUserIdAndStatus(userId, BookingStatus.COMPLETED)
                .stream()
                .map(b -> ReviewDto.ReviewableBooking.builder()
                        .bookingId(b.getId())
                        .hotelName("Khách sạn #" + b.getHotel())   // sẽ join hotels sau
                        .roomNumber("Phòng #" + b.getRoom())
                        .checkIn(b.getCheckIn().format(DATE_FMT))
                        .checkOut(b.getCheckOut().format(DATE_FMT))
                        .alreadyReviewed(reviewRepository
                                .existsByBookingIdAndUserId(b.getId(), userId))
                        .build())
                .toList();
    }

    // Lấy tất cả review của user hiện tại
    @Transactional(readOnly = true)
    public List<ReviewDto.Response> getMyReviews(Integer userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(r -> toResponse(r, userId))
                .toList();
    }

    // Lấy review theo hotel
    @Transactional(readOnly = true)
    public List<ReviewDto.Response> getReviewsByHotel(Integer hotelId) {
        return reviewRepository.findByHotelId(hotelId)
                .stream()
                .map(r -> toResponse(r, r.getUserId()))
                .toList();
    }

    // Điểm trung bình hotel
    @Transactional(readOnly = true)
    public ReviewDto.HotelRating getHotelRating(Integer hotelId) {
        Double avg = reviewRepository.averageRatingByHotelId(hotelId);
        int total = reviewRepository.findByHotelId(hotelId).size();
        return ReviewDto.HotelRating.builder()
                .hotelId(hotelId)
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .totalReviews(total)
                .build();
    }

    // Xóa đánh giá
    @Transactional
    public void deleteReview(Integer reviewId, Integer userId) {
        if (reviewId == null) {
            throw new RuntimeException("Review not found");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đánh giá #" + reviewId));

        if (!review.getUserId().equals(userId)) {
            throw new ReviewException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }

    // Helper
    private ReviewDto.Response toResponse(Review r, Integer userId) {
        String fullName = userRepository.findById(userId)
                .map(u -> u.getFullName())
                .orElse("Người dùng ẩn danh");
                
        return ReviewDto.Response.builder()
                .id(r.getId())
                .bookingId(r.getBookingId())
                .userId(r.getUserId())
                .userFullName(fullName)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
