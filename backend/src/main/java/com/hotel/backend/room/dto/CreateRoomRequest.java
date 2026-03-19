package com.hotel.backend.room.dto;

import com.hotel.backend.room.entity.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateRoomRequest(
        @NotNull(message = "hotelId is required")
        Integer hotelId,

        @NotNull(message = "roomTypeId is required")
        Integer roomTypeId,

        @NotBlank(message = "roomNumber is required")
        String roomNumber,

        RoomStatus status
) {
}
