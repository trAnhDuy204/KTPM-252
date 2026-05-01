package com.hotel.backend.admin.service;

import com.hotel.backend.admin.dto.AdminBookingDto;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.room.entity.Room;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private AdminBookingService adminBookingService;

    @Test
    void getAllBookings_shouldMapBookingsToAdminBookingDtos() {
        Booking booking = mock(Booking.class);
        Hotel hotel = mock(Hotel.class);
        Room room = mock(Room.class);

        LocalDate checkIn = LocalDate.of(2026, 5, 10);
        LocalDate checkOut = LocalDate.of(2026, 5, 12);
        Instant createdAt = Instant.parse("2026-05-01T09:30:00Z");
        BookingStatus status = BookingStatus.values()[0];

        when(booking.getId()).thenReturn(1);
        when(booking.getUserId()).thenReturn(99);
        when(booking.getHotel()).thenReturn(hotel);
        when(hotel.getId()).thenReturn(10);
        when(booking.getRoom()).thenReturn(room);
        when(room.getId()).thenReturn(20);
        when(booking.getCheckIn()).thenReturn(checkIn);
        when(booking.getCheckOut()).thenReturn(checkOut);
        when(booking.getTotalPrice()).thenReturn(BigDecimal.valueOf(250.50));
        when(booking.getStatus()).thenReturn(status);
        when(booking.getCreatedAt()).thenReturn(createdAt);
        when(booking.getGuestName()).thenReturn("Nguyen Van A");
        when(booking.getGuestPhone()).thenReturn("0901234567");

        when(bookingRepository.findAll()).thenReturn(List.of(booking));

        List<AdminBookingDto> result = adminBookingService.getAllBookings();

        assertThat(result).hasSize(1);

        AdminBookingDto dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(1);
        assertThat(dto.getUserId()).isEqualTo(99);
        assertThat(dto.getHotelId()).isEqualTo(10);
        assertThat(dto.getRoomId()).isEqualTo(20);
        assertThat(dto.getCheckIn()).isEqualTo(checkIn);
        assertThat(dto.getCheckOut()).isEqualTo(checkOut);
        assertThat(dto.getTotalPrice()).isEqualByComparingTo("250.50");
        assertThat(dto.getStatus()).isEqualTo(status.name());
        assertThat(dto.getCreatedAt()).isEqualTo(createdAt);
        assertThat(dto.getGuestName()).isEqualTo("Nguyen Van A");
        assertThat(dto.getGuestPhone()).isEqualTo("0901234567");
    }

    @Test
    void getAllBookings_shouldReturnEmptyListWhenNoBookingsExist() {
        when(bookingRepository.findAll()).thenReturn(List.of());

        List<AdminBookingDto> result = adminBookingService.getAllBookings();

        assertThat(result).isEmpty();
    }
}

