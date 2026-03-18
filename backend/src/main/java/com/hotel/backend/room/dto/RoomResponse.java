package com.hotel.backend.room.dto;

import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomStatus;

public record RoomResponse(
        Integer id,
        Integer hotelId,
        Integer roomTypeId,
        String roomTypeName,
        Integer roomTypeCapacity,
        String roomNumber,
        RoomStatus status
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getHotel().getId(),
                room.getRoomType().getId(),
                room.getRoomType().getName(),
                room.getRoomType().getCapacity(),
                room.getRoomNumber(),
                room.getStatus()
        );
    }
}
