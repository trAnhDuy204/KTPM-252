package com.hotel.backend.review.service;

import com.hotel.backend.review.dto.ReviewDto;
import com.hotel.backend.review.entity.Review;
import com.hotel.backend.auth.entity.*;
import com.hotel.backend.review.exception.ResourceNotFoundException;
import com.hotel.backend.review.exception.ReviewException;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.review.respository.ReviewRepository;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.auth.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService Tests")
class ReviewServiceTest {

    @Mock private ReviewRepository  reviewRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private UserRepository    userRepository;

    @InjectMocks private ReviewService reviewService;

    // Fixtures
    private static final Integer USER_ID    = 1;
    private static final Integer BOOKING_ID = 10;
    private static final Integer REVIEW_ID  = 100;
    private static final Hotel HOTEL   = new Hotel();
    private static final Room ROOM    = new Room();

    private Booking completedBooking() {
        Booking booking = new Booking();
        HOTEL.setId(5);
        ROOM.setId(50);
        booking.setId(BOOKING_ID);
        booking.setUserId(USER_ID);
        booking.setHotel(HOTEL);
        booking.setRoom(ROOM);
        booking.setCheckIn(LocalDate.of(2025, 1, 10));
        booking.setCheckOut(LocalDate.of(2025, 1, 15));
        booking.setStatus(BookingStatus.COMPLETED);
        return booking;
    }

    private Review savedReview() {
        return Review.builder()
                .id(REVIEW_ID).bookingId(BOOKING_ID).userId(USER_ID)
                .rating(5).comment("Tuyệt vời!")
                .createdAt(LocalDateTime.now())
                .build();
    }

    private User sampleUser() {
        return User.builder().id(USER_ID).fullName("Nguyễn Văn A")
                .email("a@test.com").password("x").role(Role.CUSTOMER).build();
    }

    // createReview()
    @Nested @DisplayName("createReview()")
    class CreateReview {

        private ReviewDto.CreateRequest request() {
            return ReviewDto.CreateRequest.builder()
                    .bookingId(BOOKING_ID).rating(5).comment("Tuyệt vời!").build();
        }

        @Test @DisplayName("Tạo thành công khi booking COMPLETED và chưa review")
        void success() {
            when(bookingRepository.findById(BOOKING_ID))
                    .thenReturn(Optional.of(completedBooking()));
            when(reviewRepository.existsByBookingIdAndUserId(BOOKING_ID, USER_ID))
                    .thenReturn(false);
            when(reviewRepository.save(any())).thenReturn(savedReview());
            when(userRepository.findById(USER_ID))
                    .thenReturn(Optional.of(sampleUser()));

            ReviewDto.Response res = reviewService.createReview(USER_ID, request());

            assertThat(res.getRating()).isEqualTo(5);
            assertThat(res.getComment()).isEqualTo("Tuyệt vời!");
            assertThat(res.getUserFullName()).isEqualTo("Nguyễn Văn A");
            verify(reviewRepository).save(any(Review.class));
        }

        @Test @DisplayName("Ném ReviewException khi booking không thuộc về user")
        void bookingNotOwned() {
            Booking other = completedBooking();
            other.setUserId(99); // user khác
            when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.of(other));

            assertThatThrownBy(() -> reviewService.createReview(USER_ID, request()))
                    .isInstanceOf(ReviewException.class)
                    .hasMessageContaining("không có quyền");
        }

        @Test @DisplayName("Ném ReviewException khi booking chưa COMPLETED")
        void bookingNotCompleted() {
            Booking pending = completedBooking();
            pending.setStatus(BookingStatus.PENDING);
            when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.of(pending));

            assertThatThrownBy(() -> reviewService.createReview(USER_ID, request()))
                    .isInstanceOf(ReviewException.class)
                    .hasMessageContaining("COMPLETED");
        }

        @Test @DisplayName("Ném ReviewException khi đã đánh giá booking này")
        void alreadyReviewed() {
            when(bookingRepository.findById(BOOKING_ID))
                    .thenReturn(Optional.of(completedBooking()));
            when(reviewRepository.existsByBookingIdAndUserId(BOOKING_ID, USER_ID))
                    .thenReturn(true);

            assertThatThrownBy(() -> reviewService.createReview(USER_ID, request()))
                    .isInstanceOf(ReviewException.class)
                    .hasMessageContaining("đã đánh giá");
        }

        @Test @DisplayName("Ném ResourceNotFoundException khi booking không tồn tại")
        void bookingNotFound() {
            when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.createReview(USER_ID, request()))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("#" + BOOKING_ID);
        }

        @Test @DisplayName("Tạo review không có comment vẫn thành công")
        void noComment_success() {
            ReviewDto.CreateRequest req = ReviewDto.CreateRequest.builder()
                    .bookingId(BOOKING_ID).rating(4).comment(null).build();
            Review noComment = savedReview();
            noComment.setComment(null);

            when(bookingRepository.findById(BOOKING_ID))
                    .thenReturn(Optional.of(completedBooking()));
            when(reviewRepository.existsByBookingIdAndUserId(BOOKING_ID, USER_ID))
                    .thenReturn(false);
            when(reviewRepository.save(any())).thenReturn(noComment);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(sampleUser()));

            ReviewDto.Response res = reviewService.createReview(USER_ID, req);
            assertThat(res.getComment()).isNull();
        }

        @Test @DisplayName("Booking CONFIRMED chưa check-out không được đánh giá")
        void bookingConfirmed_rejected() {
            Booking confirmed = completedBooking();
            confirmed.setStatus(BookingStatus.CONFIRMED);
            when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.of(confirmed));

            assertThatThrownBy(() -> reviewService.createReview(USER_ID, request()))
                    .isInstanceOf(ReviewException.class);
        }

        @Test @DisplayName("Booking CANCELLED không được đánh giá")
        void bookingCancelled_rejected() {
            Booking cancelled = completedBooking();
            cancelled.setStatus(BookingStatus.CANCELLED);
            when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.of(cancelled));

            assertThatThrownBy(() -> reviewService.createReview(USER_ID, request()))
                    .isInstanceOf(ReviewException.class);
        }
    }

    // getReviewableBookings()
    @Nested @DisplayName("getReviewableBookings()")
    class GetReviewableBookings {

        @Test
        @DisplayName("Trả về danh sách booking COMPLETED với cờ alreadyReviewed")
        void returnsList() {
            HOTEL.setId(5);
            ROOM.setId(50);
            Booking b1 = completedBooking();
            Booking b2 = new Booking();
            b2.setId(20);
            b2.setUserId(USER_ID);
            b2.setHotel(HOTEL);
            b2.setRoom(ROOM);
            b2.setCheckIn(LocalDate.of(2025, 2, 1));
            b2.setCheckOut(LocalDate.of(2025, 2, 5));
            b2.setStatus(BookingStatus.COMPLETED);

            when(bookingRepository.findByUserIdAndStatus(USER_ID, BookingStatus.COMPLETED))
                .thenReturn(List.of(b1, b2));

            when(reviewRepository.existsByBookingIdAndUserId(BOOKING_ID, USER_ID))
                .thenReturn(true);  // b1 đã review

            when(reviewRepository.existsByBookingIdAndUserId(20, USER_ID))
                .thenReturn(false); // b2 chưa review

            List<ReviewDto.ReviewableBooking> result =
                reviewService.getReviewableBookings(USER_ID);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).isAlreadyReviewed()).isTrue();
            assertThat(result.get(1).isAlreadyReviewed()).isFalse();
        }

        @Test @DisplayName("Trả về danh sách rỗng khi không có booking COMPLETED")
        void emptyList() {
            when(bookingRepository.findByUserIdAndStatus(USER_ID, BookingStatus.COMPLETED))
                    .thenReturn(List.of());

            assertThat(reviewService.getReviewableBookings(USER_ID)).isEmpty();
        }
    }

    // getMyReviews()
    @Nested @DisplayName("getMyReviews()")
    class GetMyReviews {

        @Test @DisplayName("Trả về danh sách review của user")
        void returnsList() {
            when(reviewRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of(savedReview()));
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(sampleUser()));

            List<ReviewDto.Response> result = reviewService.getMyReviews(USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getRating()).isEqualTo(5);
        }

        @Test @DisplayName("Trả về rỗng khi user chưa có review")
        void emptyList() {
            when(reviewRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of());

            assertThat(reviewService.getMyReviews(USER_ID)).isEmpty();
        }
    }

    // getHotelRating()
    @Nested @DisplayName("getHotelRating()")
    class GetHotelRating {

        @Test @DisplayName("Tính đúng điểm trung bình")
        void averageRating() {
            when(reviewRepository.averageRatingByHotelId(5)).thenReturn(4.333);
            when(reviewRepository.findByHotelId(5))
                    .thenReturn(List.of(savedReview(), savedReview(), savedReview()));

            ReviewDto.HotelRating rating = reviewService.getHotelRating(5);

            assertThat(rating.getAverageRating()).isEqualTo(4.3);
            assertThat(rating.getTotalReviews()).isEqualTo(3);
        }

        @Test @DisplayName("Trả về 0.0 khi hotel chưa có review")
        void noReviews_returnsZero() {
            when(reviewRepository.averageRatingByHotelId(5)).thenReturn(null);
            when(reviewRepository.findByHotelId(5)).thenReturn(List.of());

            ReviewDto.HotelRating rating = reviewService.getHotelRating(5);

            assertThat(rating.getAverageRating()).isEqualTo(0.0);
            assertThat(rating.getTotalReviews()).isEqualTo(0);
        }
    }


    // deleteReview()
    @Nested @DisplayName("deleteReview()")
    class DeleteReview {

        @Test @DisplayName("Xóa thành công khi đúng chủ review")
        void success() {
            when(reviewRepository.findById(REVIEW_ID))
                    .thenReturn(Optional.of(savedReview()));

            reviewService.deleteReview(REVIEW_ID, USER_ID);

            verify(reviewRepository).delete(any(Review.class));
        }

        @Test @DisplayName("Ném ReviewException khi không phải chủ review")
        void notOwner() {
            when(reviewRepository.findById(REVIEW_ID))
                    .thenReturn(Optional.of(savedReview()));

            assertThatThrownBy(() -> reviewService.deleteReview(REVIEW_ID, 999))
                    .isInstanceOf(ReviewException.class)
                    .hasMessageContaining("không có quyền xóa");
        }

        @Test @DisplayName("Ném ResourceNotFoundException khi review không tồn tại")
        void notFound() {
            when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.deleteReview(REVIEW_ID, USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(reviewRepository, never()).delete(any());
        }
    }
}
