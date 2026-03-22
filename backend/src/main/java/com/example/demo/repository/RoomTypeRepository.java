package com.example.demo.repository;
import com.example.demo.entity.RoomType;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> { 
    // Tìm kiếm phòng theo số phòng (Phục vụ chức năng tìm kiếm)
    List<RoomType> findByNameContainingIgnoreCase(String name);
}