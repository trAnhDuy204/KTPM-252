package com.hotel.backend.review.respository;

import com.hotel.backend.review.entity.Review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // Kiểm tra đã đánh giá booking này chưa
    boolean existsByBookingIdAndUserId(Integer bookingId, Integer userId);

    // Lấy tất cả review của một user
    List<Review> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Lấy tất cả review của một hotel
    @Query("SELECT r FROM Review r WHERE r.bookingId IN " +
           "(SELECT b.id FROM Booking b WHERE b.hotel.id = :hotelId)")
    List<Review> findByHotelId(Integer hotelId);

    // Tính điểm trung bình của hotel
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.bookingId IN " +
           "(SELECT b.id FROM Booking b WHERE b.hotel.id = :hotelId)")
    Double averageRatingByHotelId(Integer hotelId);

    Optional<Review> findByBookingIdAndUserId(Integer bookingId, Integer userId);
}
