package com.hotel.backend.review.controller;

import com.hotel.backend.auth.entity.User;
import com.hotel.backend.review.dto.ReviewDto;
import com.hotel.backend.review.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    @Test
    void createReview_shouldReturnCreatedReviewWithCreatedStatus() {
        User user = mock(User.class);
        ReviewDto.CreateRequest request = mock(ReviewDto.CreateRequest.class);
        ReviewDto.Response expectedResponse = mock(ReviewDto.Response.class);

        when(user.getId()).thenReturn(1);
        when(reviewService.createReview(1, request)).thenReturn(expectedResponse);

        ResponseEntity<ReviewDto.Response> response =
                reviewController.createReview(user, request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(reviewService).createReview(1, request);
    }

    @Test
    void getReviewableBookings_shouldReturnReviewableBookingsFromService() {
        User user = mock(User.class);
        ReviewDto.ReviewableBooking booking = mock(ReviewDto.ReviewableBooking.class);
        List<ReviewDto.ReviewableBooking> expectedResponse = List.of(booking);

        when(user.getId()).thenReturn(1);
        when(reviewService.getReviewableBookings(1)).thenReturn(expectedResponse);

        ResponseEntity<List<ReviewDto.ReviewableBooking>> response =
                reviewController.getReviewableBookings(user);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(reviewService).getReviewableBookings(1);
    }

    @Test
    void getMyReviews_shouldReturnMyReviewsFromService() {
        User user = mock(User.class);
        ReviewDto.Response review = mock(ReviewDto.Response.class);
        List<ReviewDto.Response> expectedResponse = List.of(review);

        when(user.getId()).thenReturn(1);
        when(reviewService.getMyReviews(1)).thenReturn(expectedResponse);

        ResponseEntity<List<ReviewDto.Response>> response =
                reviewController.getMyReviews(user);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(reviewService).getMyReviews(1);
    }

    @Test
    void getHotelReviews_shouldReturnHotelReviewsFromService() {
        Integer hotelId = 10;
        ReviewDto.Response review = mock(ReviewDto.Response.class);
        List<ReviewDto.Response> expectedResponse = List.of(review);

        when(reviewService.getReviewsByHotel(hotelId)).thenReturn(expectedResponse);

        ResponseEntity<List<ReviewDto.Response>> response =
                reviewController.getHotelReviews(hotelId);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(reviewService).getReviewsByHotel(hotelId);
    }

    @Test
    void getHotelRating_shouldReturnHotelRatingFromService() {
        Integer hotelId = 10;
        ReviewDto.HotelRating expectedResponse = mock(ReviewDto.HotelRating.class);

        when(reviewService.getHotelRating(hotelId)).thenReturn(expectedResponse);

        ResponseEntity<ReviewDto.HotelRating> response =
                reviewController.getHotelRating(hotelId);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(reviewService).getHotelRating(hotelId);
    }

    @Test
    void deleteReview_shouldCallServiceAndReturnNoContent() {
        Integer reviewId = 5;
        User user = mock(User.class);

        when(user.getId()).thenReturn(1);

        ResponseEntity<Void> response = reviewController.deleteReview(reviewId, user);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        verify(reviewService).deleteReview(reviewId, 1);
    }
}
