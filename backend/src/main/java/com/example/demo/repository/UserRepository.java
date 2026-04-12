package com.example.demo.repository;

import com.example.demo.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    List<User> findByRole(String role);

    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByHotelId(Integer hotelId);s
}