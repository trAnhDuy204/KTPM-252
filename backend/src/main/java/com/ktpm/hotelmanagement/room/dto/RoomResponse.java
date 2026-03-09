package com.ktpm.hotelmanagement.room.dto;

import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;

public record RoomResponse(
        Integer id,
        Integer hotelId,
        Integer roomTypeId,
        String roomNumber,
        RoomStatus status
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getHotel().getId(),
                room.getRoomType().getId(),
                room.getRoomNumber(),
                room.getStatus()
        );
    }
}
