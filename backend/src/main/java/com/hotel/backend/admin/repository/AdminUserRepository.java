package com.hotel.backend.admin.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotel.backend.admin.entity.AdminUser;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Integer> {

    List<AdminUser> findByRole(String role);

    List<AdminUser> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByHotelId(Integer hotelId);
}