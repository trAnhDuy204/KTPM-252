package com.example.demo.repository;

import com.example.demo.entity.RoomType;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    List<RoomType> findByNameContainingIgnoreCase(String name);

    boolean existsByNameAndCapacityAndBasePriceAndDescription(
            String name,
            Integer capacity,
            java.math.BigDecimal basePrice,
            String description);

    boolean existsByNameAndCapacityAndBasePriceAndDescriptionAndIdNot(
            String name,
            Integer capacity,
            java.math.BigDecimal basePrice,
            String description,
            Integer id);
}