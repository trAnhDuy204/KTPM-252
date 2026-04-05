package com.hotel.backend.booking.controller;

import com.hotel.backend.booking.dto.BookingResponse;
import com.hotel.backend.booking.dto.CheckInRequest;
import com.hotel.backend.booking.dto.CreateBookingRequest;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reception/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public BookingResponse confirmBooking(@PathVariable Integer bookingId) {
        return bookingService.confirmBooking(bookingId);
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse checkIn(@Valid @RequestBody CheckInRequest request) {
        return bookingService.checkIn(request);
    }

    @PostMapping("/{bookingId}/check-out")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public BookingResponse checkOut(@PathVariable Integer bookingId) {
        return bookingService.checkOut(bookingId);
    }

    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public BookingResponse cancel(@PathVariable Integer bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    @GetMapping
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public List<BookingResponse> getBookings(
            @RequestParam(required = false) Integer hotelId,
            @RequestParam(required = false) BookingStatus status
    ) {
        return bookingService.getBookings(hotelId, status);
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public BookingResponse getBooking(@PathVariable Integer bookingId) {
        return bookingService.getBooking(bookingId);
    }
}
