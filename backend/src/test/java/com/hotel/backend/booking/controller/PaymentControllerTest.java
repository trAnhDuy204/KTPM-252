package com.hotel.backend.booking.controller;

import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.booking.service.VnpayService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private VnpayService vnPayService;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PaymentController paymentController;

    @Test
    void pay_shouldCreatePaymentUrlFromBookingTotalPrice() throws Exception {
        Integer bookingId = 1;
        Booking booking = mock(Booking.class);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(booking.getTotalPrice()).thenReturn(BigDecimal.valueOf(250000));
        when(vnPayService.createPaymentUrl(bookingId, 250000L))
                .thenReturn("https://vnpay.vn/payment-url");

        String result = paymentController.pay(bookingId);

        assertThat(result).isEqualTo("https://vnpay.vn/payment-url");

        verify(bookingRepository).findById(bookingId);
        verify(vnPayService).createPaymentUrl(bookingId, 250000L);
    }

    @Test
    void vnpayReturn_shouldRedirectToErrorWhenTxnRefIsMissing() throws Exception {
        HttpServletResponse response = mock(HttpServletResponse.class);
        Map<String, String> params = new HashMap<>();
        params.put("vnp_ResponseCode", "00");

        paymentController.vnpayReturn(params, response);

        verify(response).sendRedirect("http://localhost:5173/payment-result?status=error");
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void vnpayReturn_shouldSetBookingPendingAndRedirectSuccessWhenPaymentSuccess() throws Exception {
        Integer bookingId = 1;
        Booking booking = mock(Booking.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", bookingId.toString());

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        paymentController.vnpayReturn(params, response);

        verify(booking).setStatus(BookingStatus.PENDING);
        verify(bookingRepository).save(booking);
        verify(response).sendRedirect("http://localhost:5173/payment-result?status=success");
    }

    @Test
    void vnpayReturn_shouldSetBookingCancelledAndRedirectFailWhenPaymentFails() throws Exception {
        Integer bookingId = 1;
        Booking booking = mock(Booking.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_ResponseCode", "24");
        params.put("vnp_TxnRef", bookingId.toString());

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        paymentController.vnpayReturn(params, response);

        verify(booking).setStatus(BookingStatus.CANCELLED);
        verify(bookingRepository).save(booking);
        verify(response).sendRedirect("http://localhost:5173/payment-result?status=fail");
    }
}

