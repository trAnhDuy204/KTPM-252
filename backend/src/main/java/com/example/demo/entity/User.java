package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "full_name")
    private String fullName;
    
    private String email;
    private String password;
    private String phone;
    private String role; // ADMIN, RECEPTION, CUSTOMER
    
    @Column(name = "hotel_id")
    private Integer hotelId;
}