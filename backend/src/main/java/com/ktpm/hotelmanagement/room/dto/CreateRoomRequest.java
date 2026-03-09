package com.ktpm.hotelmanagement.room.dto;

import com.ktpm.hotelmanagement.room.entity.RoomStatus;
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
