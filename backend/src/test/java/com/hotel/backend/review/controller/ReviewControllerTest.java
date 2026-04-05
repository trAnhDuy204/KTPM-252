package com.hotel.backend.review.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.review.dto.ReviewDto;
import com.hotel.backend.auth.entity.Role;
import com.hotel.backend.auth.entity.User;
import com.hotel.backend.review.exception.ResourceNotFoundException;
import com.hotel.backend.review.exception.ReviewException;
import com.hotel.backend.review.service.ReviewService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
@DisplayName("ReviewController Tests")
class ReviewControllerTest {

    @Autowired MockMvc     mockMvc;
    @Autowired ObjectMapper mapper;
    @SuppressWarnings("removal")
    @MockBean  ReviewService reviewService;

    // Stub principal
    private User mockUser() {
        return User.builder().id(1).fullName("Nguyễn Văn A")
                .email("a@test.com").password("x").role(Role.CUSTOMER).build();
    }

    private ReviewDto.Response sampleResponse() {
        return ReviewDto.Response.builder()
                .id(100).bookingId(10).userId(1)
                .userFullName("Nguyễn Văn A").rating(5)
                .comment("Tuyệt vời!").createdAt(LocalDateTime.now())
                .build();
    }

    // POST /api/reviews
    @Nested @DisplayName("POST /api/reviews")
    class Create {

        @Test @DisplayName("201 khi tạo review hợp lệ")
        @WithMockUser(roles = "CUSTOMER")
        void created_201() throws Exception {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .bookingId(10).rating(5).comment("Tuyệt vời!").build();

            when(reviewService.createReview(anyInt(), any())).thenReturn(sampleResponse());

            mockMvc.perform(post("/api/reviews")
                            .with(csrf()).with(user(mockUser()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.rating").value(5))
                    .andExpect(jsonPath("$.comment").value("Tuyệt vời!"))
                    .andExpect(jsonPath("$.userFullName").value("Nguyễn Văn A"));
        }

        @Test @DisplayName("400 khi rating vượt quá 5")
        @WithMockUser(roles = "CUSTOMER")
        void invalidRating_400() throws Exception {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .bookingId(10).rating(6).comment("Test").build();

            mockMvc.perform(post("/api/reviews")
                            .with(csrf()).with(user(mockUser()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test @DisplayName("400 khi rating nhỏ hơn 1")
        @WithMockUser(roles = "CUSTOMER")
        void ratingTooLow_400() throws Exception {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .bookingId(10).rating(0).build();

            mockMvc.perform(post("/api/reviews")
                            .with(csrf()).with(user(mockUser()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test @DisplayName("400 khi thiếu bookingId")
        @WithMockUser(roles = "CUSTOMER")
        void missingBookingId_400() throws Exception {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .rating(4).comment("Ok").build();

            mockMvc.perform(post("/api/reviews")
                            .with(csrf()).with(user(mockUser()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test @DisplayName("400 khi đã review rồi")
        @WithMockUser(roles = "CUSTOMER")
        void alreadyReviewed_400() throws Exception {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .bookingId(10).rating(5).build();

            when(reviewService.createReview(anyInt(), any()))
                    .thenThrow(new ReviewException("Bạn đã đánh giá đặt phòng này rồi"));

            mockMvc.perform(post("/api/reviews")
                            .with(csrf()).with(user(mockUser()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Bạn đã đánh giá đặt phòng này rồi"));
        }

        @Test @DisplayName("403 khi RECEPTION cố gửi review")
        @WithMockUser(roles = "RECEPTION")
        void receptionForbidden_403() throws Exception {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .bookingId(10).rating(5).build();

            mockMvc.perform(post("/api/reviews")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isForbidden());
        }
    }

    // GET /api/reviews/my-bookings
    @Nested @DisplayName("GET /api/reviews/my-bookings")
    class MyBookings {

        @Test @DisplayName("200 trả về danh sách booking có thể review")
        @WithMockUser(roles = "CUSTOMER")
        void ok_200() throws Exception {
            List<ReviewDto.ReviewableBooking> list = List.of(
                    ReviewDto.ReviewableBooking.builder()
                            .bookingId(10).hotelName("Khách sạn A")
                            .roomNumber("101").checkIn("10/01/2025").checkOut("15/01/2025")
                            .alreadyReviewed(false).build()
            );

            when(reviewService.getReviewableBookings(anyInt())).thenReturn(list);

            mockMvc.perform(get("/api/reviews/my-bookings")
                            .with(user(mockUser())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].bookingId").value(10))
                    .andExpect(jsonPath("$[0].alreadyReviewed").value(false));
        }
    }

    // GET /api/reviews/hotel/{hotelId}
    @Nested @DisplayName("GET /api/reviews/hotel/{hotelId}")
    class HotelReviews {

        @Test @DisplayName("200 public — không cần đăng nhập")
        void public_200() throws Exception {
            when(reviewService.getReviewsByHotel(5))
                    .thenReturn(List.of(sampleResponse()));

            mockMvc.perform(get("/api/reviews/hotel/5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].rating").value(5));
        }

        @Test @DisplayName("200 hotel chưa có review trả về mảng rỗng")
        void noReviews_emptyArray() throws Exception {
            when(reviewService.getReviewsByHotel(99)).thenReturn(List.of());

            mockMvc.perform(get("/api/reviews/hotel/99"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    // GET /api/reviews/hotel/{hotelId}/rating
    @Nested @DisplayName("GET /api/reviews/hotel/{hotelId}/rating")
    class HotelRating {

        @Test @DisplayName("200 trả về điểm trung bình")
        void ok_200() throws Exception {
            ReviewDto.HotelRating rating = ReviewDto.HotelRating.builder()
                    .hotelId(5).averageRating(4.3).totalReviews(3).build();

            when(reviewService.getHotelRating(5)).thenReturn(rating);

            mockMvc.perform(get("/api/reviews/hotel/5/rating"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.averageRating").value(4.3))
                    .andExpect(jsonPath("$.totalReviews").value(3));
        }
    }

    // DELETE /api/reviews/{id}
    @Nested @DisplayName("DELETE /api/reviews/{id}")
    class Delete {

        @Test @DisplayName("204 khi xóa review của mình")
        @WithMockUser(roles = "CUSTOMER")
        void noContent_204() throws Exception {
            doNothing().when(reviewService).deleteReview(anyInt(), anyInt());

            mockMvc.perform(delete("/api/reviews/100")
                            .with(csrf()).with(user(mockUser())))
                    .andExpect(status().isNoContent());
        }

        @Test @DisplayName("404 khi review không tồn tại")
        @WithMockUser(roles = "CUSTOMER")
        void notFound_404() throws Exception {
            doThrow(new ResourceNotFoundException("Không tìm thấy đánh giá #999"))
                    .when(reviewService).deleteReview(anyInt(), anyInt());

            mockMvc.perform(delete("/api/reviews/999")
                            .with(csrf()).with(user(mockUser())))
                    .andExpect(status().isNotFound());
        }
    }
}