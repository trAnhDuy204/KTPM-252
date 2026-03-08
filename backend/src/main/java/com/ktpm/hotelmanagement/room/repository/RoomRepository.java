package com.ktpm.hotelmanagement.room.repository;

import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

    boolean existsByHotelIdAndRoomNumber(Long hotelId, String roomNumber);

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByStatus(RoomStatus status);

    List<Room> findByHotelIdAndStatus(Long hotelId, RoomStatus status);
}
