package com.hotel.backend.admin.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "full_name")
    private String fullName;
    
    private String email;
    private String password;
    private String phone;
    private String role; 
    
}
