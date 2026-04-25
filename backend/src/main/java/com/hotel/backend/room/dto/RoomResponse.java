package com.hotel.backend.room.dto;

import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.entity.RoomType;

public record RoomResponse(
        Integer id,
        Integer hotelId,
        Integer roomTypeId,
        String roomTypeName,
        Integer roomTypeCapacity,
        String roomNumber,
        RoomStatus status,
        String basePrice, //<-- Lấy baseprice của roomtype database để gộp chung vs data của room r gửi json về react.
        String hotelName
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getHotel().getId(),
                room.getRoomType().getId(),
                room.getRoomType().getName(),
                room.getRoomType().getCapacity(),
                room.getRoomNumber(),
                room.getStatus(),
                room.getRoomType().getBasePrice().toPlainString(),//phương thức lấy baseprice.
                room.getHotel().getName()
        );
    }
}
