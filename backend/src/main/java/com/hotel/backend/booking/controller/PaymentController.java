package com.hotel.backend.booking.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.booking.service.VnpayService;

@RestController
@RequestMapping("/api/public/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final VnpayService vnPayService;
    private final BookingRepository bookingRepository;

    public PaymentController(VnpayService vnPayService, BookingRepository bookingRepository) {
        this.vnPayService = vnPayService;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/vnpay")
    public String pay(@RequestParam Integer bookingId) throws Exception {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow();

        long amount = booking.getTotalPrice().longValue();

        return vnPayService.createPaymentUrl(bookingId, amount);
    }
}
