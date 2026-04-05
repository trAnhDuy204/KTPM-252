package com.hotel.backend.admin.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotel.backend.admin.entity.AdminHotel;

@Repository
public interface AdminHotelRepository extends JpaRepository<AdminHotel, Integer> { }