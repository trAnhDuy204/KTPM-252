package com.hotel.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateBookingRequest(
        @NotNull(message = "roomId is required")
        Integer roomId,

        @NotNull(message = "checkIn date is required")
        LocalDate checkIn,

        @NotNull(message = "checkOut date is required")
        LocalDate checkOut,

        @NotBlank(message = "guestName is required")
        String guestName,

        String guestPhone
) {
}
