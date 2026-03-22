package com.example.demo.repository;

import com.example.demo.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // 1. Tìm danh sách theo Role
    List<User> findByRole(String role);

    // 2. Tìm kiếm theo Tên hoặc Email (Đã khớp với AdminController)
    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email);

    // 🔴 XÓA DÒNG existsByUsername ĐI VÌ MÌNH KHÔNG DÙNG CỘT USERNAME NỮA
    // Nếu muốn check trùng Email, Lan Anh dùng dòng này thay thế:
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}