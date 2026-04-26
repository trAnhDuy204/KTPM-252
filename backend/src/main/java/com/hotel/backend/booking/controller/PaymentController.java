package com.hotel.backend.booking.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
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

    @GetMapping("/vnpay-return")
    public void vnpayReturn(@RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        if (txnRef == null) {
            response.sendRedirect("http://localhost:5173/payment-result?status=error");
            return;
        }

        Integer bookingId = Integer.parseInt(txnRef);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow();

        if ("00".equals(responseCode)) {

            booking.setStatus(BookingStatus.PENDING);
            bookingRepository.save(booking);

            response.sendRedirect("http://localhost:5173/payment-result?status=success");
            return;
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        response.sendRedirect("http://localhost:5173/payment-result?status=fail");
    }
}
