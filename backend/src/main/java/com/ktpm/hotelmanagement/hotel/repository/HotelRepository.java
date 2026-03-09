package com.ktpm.hotelmanagement.hotel.repository;

import com.ktpm.hotelmanagement.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, Integer> {
}
