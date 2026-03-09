package com.ktpm.hotelmanagement.room.repository;

import com.ktpm.hotelmanagement.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    List<RoomType> findByHotel_Id(Integer hotelId);
}
