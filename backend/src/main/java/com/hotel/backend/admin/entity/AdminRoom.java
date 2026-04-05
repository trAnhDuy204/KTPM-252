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

    private String status; // AVAILABLE, OCCUPIED, CLEANING...

    @Column(name = "hotel_id")
    private Integer hotelId;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    private AdminRoomType roomType; // Kết nối để lấy thông tin Loại phòng & Giá
}