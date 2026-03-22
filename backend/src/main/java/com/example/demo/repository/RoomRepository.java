package com.example.demo.repository;

import com.example.demo.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    // Hàm này giúp Admin gõ số phòng để tìm kiếm nhanh
    List<Room> findByRoomNumberContaining(String roomNumber);

    // Tìm tất cả phòng thuộc về một khách sạn cụ thể
    List<Room> findByHotelId(Integer hotelId);

    boolean existsByRoomType_Id(Integer id);
}