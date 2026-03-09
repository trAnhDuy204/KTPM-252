package com.ktpm.hotelmanagement.room.repository;

import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    boolean existsByHotel_IdAndRoomNumber(Integer hotelId, String roomNumber);

    List<Room> findByHotel_Id(Integer hotelId);

    List<Room> findByStatus(RoomStatus status);

    List<Room> findByHotel_IdAndStatus(Integer hotelId, RoomStatus status);
}
