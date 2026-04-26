package com.hotel.backend.booking.controller;

import com.hotel.backend.booking.dto.BookingResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import com.hotel.backend.booking.service.PublicBookingServic;
import com.hotel.backend.booking.dto.CreateBookingRequest;
import java.util.List;

@RestController
@RequestMapping("/api/public/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicBookingController {

    private final PublicBookingServic bookingService;

    public PublicBookingController(PublicBookingServic bookingService) {
        this.bookingService = bookingService;
    }

    // CREATE BOOKING 
    @PostMapping
    public BookingResponse createBooking(@RequestBody CreateBookingRequest request) {
        return bookingService.createBookingForCustomer(request);
    }

    // GET USER BOOKINGS 
    @GetMapping
    public List<BookingResponse> getMyBookings(@RequestParam Integer userId) {
        return bookingService.getBookings(null, null)
                .stream()
                .filter(b -> b.id().equals(userId)) // temporary logic (we can improve later)
                .toList();
    }

    //  CANCEL BOOKING 
    @PostMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Integer id) {
        return bookingService.cancelBooking(id);
    }
}
