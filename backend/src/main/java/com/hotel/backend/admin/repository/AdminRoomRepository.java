package com.hotel.backend.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotel.backend.admin.entity.AdminRoom;

import java.util.List;

@Repository
public interface AdminRoomRepository extends JpaRepository<AdminRoom, Integer> {

    List<AdminRoom> findByRoomNumberContaining(String roomNumber);

    List<AdminRoom> findByHotelId(Integer hotelId);

    boolean existsByRoomType_Id(Integer id);
}