package com.hotel.backend.services.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HotelService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "hotel_id")
    private Integer hotelId;

    @Column(length = 100)
    private String name;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;
}