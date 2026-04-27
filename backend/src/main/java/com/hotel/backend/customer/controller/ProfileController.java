package com.hotel.backend.customer.controller;

import com.hotel.backend.customer.dto.ProfileDto;
import com.hotel.backend.auth.entity.User;
import com.hotel.backend.customer.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    //GET /api/profile
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileDto.ProfileResponse> getProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    //PUT /api/profile
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileDto.ProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(user.getId(), request));
    }

    //PUT /api/profile/password
    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileDto.ChangePasswordRequest request) {
        profileService.changePassword(user.getId(), request);
        return ResponseEntity.noContent().build();
    }

    //GET /api/profile/bookings
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ProfileDto.BookingItem>> getBookingHistory(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getBookingHistory(user.getId()));
    }

    //GET /api/profile/bookings/summary
    @GetMapping("/bookings/summary")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ProfileDto.BookingSummary> getBookingSummary(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getBookingSummary(user.getId()));
    }
}
