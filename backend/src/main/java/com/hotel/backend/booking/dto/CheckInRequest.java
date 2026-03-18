package com.hotel.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CheckInRequest(
        @NotNull(message = "roomId is required")
        Integer roomId,

        @NotNull(message = "checkOut date is required")
        LocalDate checkOut,

        @NotBlank(message = "guestName is required")
        String guestName,

        String guestPhone
) {
}
