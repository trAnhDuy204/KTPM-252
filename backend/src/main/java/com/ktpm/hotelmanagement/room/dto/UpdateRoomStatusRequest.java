package com.ktpm.hotelmanagement.room.dto;

import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateRoomStatusRequest(
        @NotNull(message = "status is required")
        RoomStatus status
) {
}
