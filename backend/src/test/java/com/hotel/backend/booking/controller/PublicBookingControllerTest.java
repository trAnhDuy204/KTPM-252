package com.hotel.backend.booking.controller;

import com.hotel.backend.booking.dto.BookingResponse;
import com.hotel.backend.booking.dto.CreateBookingRequest;
import com.hotel.backend.booking.service.PublicBookingServic;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicBookingControllerTest {

    @Mock
    private PublicBookingServic bookingService;

    @InjectMocks
    private PublicBookingController publicBookingController;

    @Test
    void createBooking_shouldReturnBookingResponseFromService() {
        CreateBookingRequest request = mock(CreateBookingRequest.class);
        BookingResponse expectedResponse = mock(BookingResponse.class);

        when(bookingService.createBookingForCustomer(request)).thenReturn(expectedResponse);

        BookingResponse result = publicBookingController.createBooking(request);

        assertThat(result).isSameAs(expectedResponse);
        verify(bookingService).createBookingForCustomer(request);
    }

    @Test
    void getMyBookings_shouldReturnBookingsFilteredByUserIdUsingCurrentLogic() {
        Integer userId = 1;

        BookingResponse matchingBooking = mock(BookingResponse.class);
        BookingResponse otherBooking = mock(BookingResponse.class);

        when(matchingBooking.id()).thenReturn(1);
        when(otherBooking.id()).thenReturn(2);

        when(bookingService.getBookings(null, null))
                .thenReturn(List.of(matchingBooking, otherBooking));

        List<BookingResponse> result = publicBookingController.getMyBookings(userId);

        assertThat(result).containsExactly(matchingBooking);
        verify(bookingService).getBookings(null, null);
    }

    @Test
    void getMyBookings_shouldReturnEmptyListWhenNoBookingMatchesUserId() {
        Integer userId = 99;

        BookingResponse booking = mock(BookingResponse.class);
        when(booking.id()).thenReturn(1);

        when(bookingService.getBookings(null, null))
                .thenReturn(List.of(booking));

        List<BookingResponse> result = publicBookingController.getMyBookings(userId);

        assertThat(result).isEmpty();
        verify(bookingService).getBookings(null, null);
    }

    @Test
    void cancel_shouldReturnCancelledBookingFromService() {
        Integer bookingId = 1;
        BookingResponse expectedResponse = mock(BookingResponse.class);

        when(bookingService.cancelBooking(bookingId)).thenReturn(expectedResponse);

        BookingResponse result = publicBookingController.cancel(bookingId);

        assertThat(result).isSameAs(expectedResponse);
        verify(bookingService).cancelBooking(bookingId);
    }
}

