package com.example.demo.repository;

import com.example.demo.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    List<Room> findByRoomNumberContaining(String roomNumber);

    List<Room> findByHotelId(Integer hotelId);

    boolean existsByRoomType_Id(Integer id);

    void deleteByHotelId(Integer hotelId);

    boolean existsByHotelIdAndStatusNot(Integer hotelId, String status);

}