package com.hotel.backend.booking.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.auth.service.CustomUserDetailsService;
import com.hotel.backend.booking.dto.BookingResponse;
import com.hotel.backend.booking.dto.CheckInRequest;
import com.hotel.backend.booking.dto.CreateBookingRequest;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.service.BookingService;
import com.hotel.backend.common.BusinessRuleException;
import com.hotel.backend.common.ResourceNotFoundException;
import com.hotel.backend.config.SecurityConfig;
import com.hotel.backend.security.JwtAuthFilter;
import com.hotel.backend.security.JwtService;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BookingController.class)
@Import(SecurityConfig.class)
@WithMockUser(roles = "RECEPTION")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookingService bookingService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private static final String BASE_URL = "/api/reception/bookings";

    private BookingResponse sampleResponse(BookingStatus status) {
        return new BookingResponse(
                1, 10, "101", 1,
                LocalDate.of(2026, 3, 16), LocalDate.of(2026, 3, 18),
                new BigDecimal("1000000"), status,
                "Nguyen Van A", "0901234567",
                Instant.now()
        );
    }

    // ==================== POST / (create booking) ====================

    @Nested
    class CreateBookingEndpoint {

        @Test
        void shouldCreateBookingSuccessfully() throws Exception {
            CreateBookingRequest request = new CreateBookingRequest(
                    10, LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 3), "Nguyen Van B", null);
            when(bookingService.createBooking(any(CreateBookingRequest.class)))
                    .thenReturn(sampleResponse(BookingStatus.PENDING));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status", is("PENDING")));
        }

        @Test
        void shouldReturn400WhenRoomNotAvailable() throws Exception {
            CreateBookingRequest request = new CreateBookingRequest(
                    10, LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 3), "Guest", null);
            when(bookingService.createBooking(any(CreateBookingRequest.class)))
                    .thenThrow(new BusinessRuleException("Room is not available for booking"));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Room is not available for booking")));
        }

        @Test
        void shouldReturn400WhenMissingRequiredFields() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /{id}/confirm ====================

    @Nested
    class ConfirmBookingEndpoint {

        @Test
        void shouldConfirmBookingSuccessfully() throws Exception {
            when(bookingService.confirmBooking(1))
                    .thenReturn(sampleResponse(BookingStatus.CONFIRMED));

            mockMvc.perform(post(BASE_URL + "/1/confirm"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("CONFIRMED")));
        }

        @Test
        void shouldReturn400WhenBookingNotPending() throws Exception {
            when(bookingService.confirmBooking(1))
                    .thenThrow(new BusinessRuleException("Only PENDING bookings can be confirmed"));

            mockMvc.perform(post(BASE_URL + "/1/confirm"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Only PENDING bookings can be confirmed")));
        }

        @Test
        void shouldReturn404WhenBookingNotFound() throws Exception {
            when(bookingService.confirmBooking(99))
                    .thenThrow(new ResourceNotFoundException("Booking not found with id: 99"));

            mockMvc.perform(post(BASE_URL + "/99/confirm"))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== POST /check-in ====================

    @Nested
    class CheckInEndpoint {

        @Test
        void shouldCheckInSuccessfully() throws Exception {
            CheckInRequest request = new CheckInRequest(10, LocalDate.of(2026, 3, 18), "Nguyen Van A", "0901234567");
            when(bookingService.checkIn(any(CheckInRequest.class)))
                    .thenReturn(sampleResponse(BookingStatus.CHECKED_IN));

            mockMvc.perform(post(BASE_URL + "/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status", is("CHECKED_IN")))
                    .andExpect(jsonPath("$.guestName", is("Nguyen Van A")))
                    .andExpect(jsonPath("$.roomNumber", is("101")));
        }

        @Test
        void shouldReturn400WhenRoomNotAvailable() throws Exception {
            CheckInRequest request = new CheckInRequest(10, LocalDate.of(2026, 3, 18), "Guest", null);
            when(bookingService.checkIn(any(CheckInRequest.class)))
                    .thenThrow(new BusinessRuleException("Room is not available for check-in"));

            mockMvc.perform(post(BASE_URL + "/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Room is not available for check-in")));
        }

        @Test
        void shouldReturn400WhenMissingRequiredFields() throws Exception {
            String body = "{}";

            mockMvc.perform(post(BASE_URL + "/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /{id}/check-out ====================

    @Nested
    class CheckOutEndpoint {

        @Test
        void shouldCheckOutSuccessfully() throws Exception {
            when(bookingService.checkOut(1))
                    .thenReturn(sampleResponse(BookingStatus.COMPLETED));

            mockMvc.perform(post(BASE_URL + "/1/check-out"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("COMPLETED")));
        }

        @Test
        void shouldReturn400WhenBookingNotCheckedIn() throws Exception {
            when(bookingService.checkOut(1))
                    .thenThrow(new BusinessRuleException("Booking is not checked in"));

            mockMvc.perform(post(BASE_URL + "/1/check-out"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Booking is not checked in")));
        }

        @Test
        void shouldReturn404WhenBookingNotFound() throws Exception {
            when(bookingService.checkOut(99))
                    .thenThrow(new ResourceNotFoundException("Booking not found with id: 99"));

            mockMvc.perform(post(BASE_URL + "/99/check-out"))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== POST /{id}/cancel ====================

    @Nested
    class CancelEndpoint {

        @Test
        void shouldCancelSuccessfully() throws Exception {
            when(bookingService.cancelBooking(1))
                    .thenReturn(sampleResponse(BookingStatus.CANCELLED));

            mockMvc.perform(post(BASE_URL + "/1/cancel"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("CANCELLED")));
        }

        @Test
        void shouldReturn400WhenCannotCancel() throws Exception {
            when(bookingService.cancelBooking(1))
                    .thenThrow(new BusinessRuleException("Cannot cancel a booking that is COMPLETED"));

            mockMvc.perform(post(BASE_URL + "/1/cancel"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /bookings ====================

    @Nested
    class GetBookingsEndpoint {

        @Test
        void shouldReturnAllBookings() throws Exception {
            when(bookingService.getBookings(null, null))
                    .thenReturn(List.of(sampleResponse(BookingStatus.CHECKED_IN)));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].status", is("CHECKED_IN")));
        }

        @Test
        void shouldFilterByStatus() throws Exception {
            when(bookingService.getBookings(null, BookingStatus.CHECKED_IN))
                    .thenReturn(List.of(sampleResponse(BookingStatus.CHECKED_IN)));

            mockMvc.perform(get(BASE_URL).param("status", "CHECKED_IN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void shouldReturnSingleBooking() throws Exception {
            when(bookingService.getBooking(1))
                    .thenReturn(sampleResponse(BookingStatus.CHECKED_IN));

            mockMvc.perform(get(BASE_URL + "/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)));
        }
    }

    // ==================== Authorization ====================

    @Nested
    class Authorization {

        @Test
        @WithMockUser(roles = "CUSTOMER")
        void shouldReturn403WhenNotReceptionRole() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isForbidden());
        }
    }
}
