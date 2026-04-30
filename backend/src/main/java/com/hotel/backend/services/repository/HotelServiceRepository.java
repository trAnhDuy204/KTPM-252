package com.hotel.backend.services.repository;

import com.hotel.backend.services.entity.HotelService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelServiceRepository extends JpaRepository<HotelService, Integer> {

    // Lấy tất cả dịch vụ của một khách sạn
    List<HotelService> findByHotelId(Integer hotelId);

    // Xóa tất cả dịch vụ của một khách sạn
    void deleteByHotelId(Integer hotelId);
}
