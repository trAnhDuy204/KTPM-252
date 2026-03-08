package com.ktpm.hotelmanagement.room.dto;

import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;

public record RoomResponse(
        Long id,
        Long hotelId,
        Long roomTypeId,
        String roomNumber,
        RoomStatus status
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getHotelId(),
                room.getRoomTypeId(),
                room.getRoomNumber(),
                room.getStatus()
        );
    }
}
