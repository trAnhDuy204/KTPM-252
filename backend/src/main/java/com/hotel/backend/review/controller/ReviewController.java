package com.hotel.backend.review.controller;

import com.hotel.backend.review.dto.ReviewDto;
import com.hotel.backend.auth.entity.User;
import com.hotel.backend.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    //POST /api/reviews
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDto.Response> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewDto.CreateRequest request) {

        ReviewDto.Response response = reviewService.createReview(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //GET /api/reviews/my-bookings
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewDto.ReviewableBooking>> getReviewableBookings(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(reviewService.getReviewableBookings(user.getId()));
    }

    //GET /api/reviews/my-reviews
    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewDto.Response>> getMyReviews(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(reviewService.getMyReviews(user.getId()));
    }

    // GET /api/reviews/hotel/{hotelId}
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ReviewDto.Response>> getHotelReviews(
            @PathVariable Integer hotelId) {

        return ResponseEntity.ok(reviewService.getReviewsByHotel(hotelId));
    }

    //GET /api/reviews/hotel/{hotelId}/rating
    @GetMapping("/hotel/{hotelId}/rating")
    public ResponseEntity<ReviewDto.HotelRating> getHotelRating(
            @PathVariable Integer hotelId) {

        return ResponseEntity.ok(reviewService.getHotelRating(hotelId));
    }

    // DELETE /api/reviews/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Integer id,
            @AuthenticationPrincipal User user) {

        reviewService.deleteReview(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
