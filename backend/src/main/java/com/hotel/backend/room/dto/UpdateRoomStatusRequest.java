package com.hotel.backend.room.dto;

import com.hotel.backend.room.entity.RoomStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateRoomStatusRequest(
        @NotNull(message = "status is required")
        RoomStatus status
) {
}
