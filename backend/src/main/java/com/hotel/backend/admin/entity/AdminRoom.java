package com.hotel.backend.admin.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rooms")
@Data
public class AdminRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "room_number")
    private String roomNumber;

    private String status;

    @Column(name = "hotel_id")
    private Integer hotelId;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    private AdminRoomType roomType;
}