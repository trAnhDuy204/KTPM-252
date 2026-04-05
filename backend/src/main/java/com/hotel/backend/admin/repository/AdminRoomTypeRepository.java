package com.hotel.backend.admin.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotel.backend.admin.entity.AdminRoomType;

@Repository
public interface AdminRoomTypeRepository extends JpaRepository<AdminRoomType, Integer> { 
    List<AdminRoomType> findByNameContainingIgnoreCase(String name);
}