package com.hotel.backend.review.dto;


import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public class ReviewDto {

    //Tạo đánh giá
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {

        @NotNull(message = "Booking ID là bắt buộc")
        private Integer bookingId;

        @NotNull(message = "Điểm đánh giá là bắt buộc")
        @Min(value = 1, message = "Điểm tối thiểu là 1")
        @Max(value = 5, message = "Điểm tối đa là 5")
        private Integer rating;

        @Size(max = 2000, message = "Nhận xét tối đa 2000 ký tự")
        private String comment;
    }

    // Response trả về client
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Integer id;
        private Integer bookingId;
        private Integer userId;
        private String userFullName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }

    // Thông tin booking có thể đánh giá
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReviewableBooking {
        private Integer bookingId;
        private String hotelName;
        private String roomNumber;
        private String checkIn;
        private String checkOut;
        private boolean alreadyReviewed;
    }

    // Điểm trung bình
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class HotelRating {
        private Integer hotelId;
        private Double averageRating;
        private Integer totalReviews;
    }
}
