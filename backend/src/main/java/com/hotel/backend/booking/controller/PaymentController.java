package com.hotel.backend.booking.controller;

import java.io.IOException;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.booking.service.VnpayService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.hotel.backend.booking.service.BookingService;

@RestController
@RequestMapping("/api/public/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final VnpayService vnPayService;
    private final BookingRepository bookingRepository;

    private final BookingService bookingService;

    public PaymentController(VnpayService vnPayService,
                         BookingRepository bookingRepository,
                         BookingService bookingService) {
    this.vnPayService = vnPayService;
    this.bookingRepository = bookingRepository;
    this.bookingService = bookingService;
}

    @GetMapping("/vnpay")
    public String pay(@RequestParam Integer bookingId) throws Exception {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow();

        long amount = booking.getTotalPrice().longValue();

        return vnPayService.createPaymentUrl(bookingId, amount);
    }

    @GetMapping("/vnpay-return")
    public void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String code = request.getParameter("vnp_ResponseCode");
        String bookingId = request.getParameter("vnp_TxnRef");

        System.out.println("🔥 VNPAY RETURN: code=" + code + ", bookingId=" + bookingId);

        if (bookingId != null) {
            Integer id = Integer.parseInt(bookingId);

            if ("00".equals(code)) {
            bookingService.confirmBooking(id);
            } else {
            bookingService.cancelBooking(id);
            }
        }

    // redirect back to frontend
    response.sendRedirect("http://localhost:5173/payment-result?code=" + code);
}
}
