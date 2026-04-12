package com.hotel.backend.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "room_types")
@Data
public class AdminRoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "hotel_id")
    private Integer hotelId;
    
    private String name;
    private Integer capacity;
    
    @Column(name = "base_price")
    private BigDecimal basePrice;
    
    private String description;
}