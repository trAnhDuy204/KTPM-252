package com.hotel.backend.admin.controller;

import com.hotel.backend.admin.entity.AdminHotel;
import com.hotel.backend.admin.entity.AdminRoom;
import com.hotel.backend.admin.entity.AdminRoomType;
import com.hotel.backend.admin.entity.AdminUser;
import com.hotel.backend.admin.repository.AdminHotelRepository;
import com.hotel.backend.admin.repository.AdminRoomRepository;
import com.hotel.backend.admin.repository.AdminRoomTypeRepository;
import com.hotel.backend.admin.repository.AdminUserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminHotelRepository hotelRepo;
    @Autowired
    private AdminRoomTypeRepository roomTypeRepo;
    @Autowired
    private AdminUserRepository userRepo;
    @Autowired
    private AdminRoomRepository roomRepo; 

    // QUẢN LÝ KHÁCH SẠN
    @GetMapping("/hotels")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminHotel> getAllHotels() {
        return hotelRepo.findAll();
    }

    @PostMapping("/hotels")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminHotel addHotel(@RequestBody AdminHotel hotel) {
        return hotelRepo.save(hotel);
    }

    // QUẢN LÝ PHÒNG (Gộp Loại phòng & Giá)
    // Xem danh sách phòng kèm thông tin loại phòng và giá
    @GetMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminRoom> getAllRooms() {
        return roomRepo.findAll();
    }

    // Thêm hoặc Sửa phòng 
    @PostMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminRoom saveRoom(@RequestBody AdminRoom room) {
        return roomRepo.save(room);
    }

    // Xóa phòng cụ thể (ID phòng)
    @DeleteMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRoom(@PathVariable Integer id) {
        roomRepo.deleteById(id);
    }

    @PutMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminRoom updateRoom(@PathVariable Integer id, @RequestBody AdminRoom newRoom) {
        return roomRepo.findById(id).map(room -> {
            room.setRoomNumber(newRoom.getRoomNumber());
            room.setStatus(newRoom.getStatus());
            room.setRoomType(newRoom.getRoomType());

            if (newRoom.getHotelId() != null) {
                room.setHotelId(newRoom.getHotelId());
            }

            return roomRepo.save(room);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng id: " + id));
    }

    // Lấy danh sách Loại phòng 
    @GetMapping("/room-types")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminRoomType> getAllRoomTypes() {
        return roomTypeRepo.findAll();
    }

    // Thêm/Cập nhật cấu hình Loại phòng & Giá
    @PostMapping("/room-types")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminRoomType addRoomType(@RequestBody AdminRoomType type) {
        return roomTypeRepo.save(type);
    }

    @PutMapping("/room-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminRoomType updateRoomType(@PathVariable Integer id, @RequestBody AdminRoomType newType) {
        return roomTypeRepo.findById(id).map(type -> {
            type.setName(newType.getName());
            type.setCapacity(newType.getCapacity());
            type.setBasePrice(newType.getBasePrice());
            type.setDescription(newType.getDescription());
            return roomTypeRepo.save(type);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng id: " + id));
    }

    @DeleteMapping("/room-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRoomType(@PathVariable Integer id) {
        boolean isUsed = roomRepo.existsByRoomType_Id(id);
        if (isUsed) {
            throw new RuntimeException("Loại phòng đang được sử dụng, không thể xóa!");
        }

        roomTypeRepo.deleteById(id);
    }

    // QUẢN LÝ TÀI KHOẢN LỄ TÂN
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUser> getAllUsers() {
        return userRepo.findAll();
    }

    // Tạo tài khoản mới 
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody AdminUser user) {
        // Nhập đủ thông tin cơ bản
        if (user.getFullName() == null || user.getEmail() == null ||
                user.getPhone() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ thông tin bắt buộc!"));
        }

        // Kiểm tra trùng Email hoặc SĐT
        if (userRepo.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã tồn tại trên hệ thống!"));
        }
        if (userRepo.existsByPhone(user.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại này đã tồn tại!"));
        }

        // Mặc định role nếu trống
        if (user.getRole() == null)
            user.setRole("RECEPTION");

        AdminUser savedUser = userRepo.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // Cập nhật tài khoản 
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody AdminUser userDetails) {
        return userRepo.findById(id).map(user -> {

            // Check trùng Email
            if (!user.getEmail().equals(userDetails.getEmail()) && userRepo.existsByEmail(userDetails.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email mới đã bị trùng với nhân viên khác!"));
            }

            //Check trùng SĐT 
            if (userDetails.getPhone() != null && !userDetails.getPhone().equals(user.getPhone())
                    && userRepo.existsByPhone(userDetails.getPhone())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại mới đã bị trùng!"));
            }

            // Cập nhật thông tin
            user.setFullName(userDetails.getFullName());
            user.setEmail(userDetails.getEmail());
            user.setPhone(userDetails.getPhone());
            user.setRole(userDetails.getRole());

            user.setHotelId(userDetails.getHotelId());

            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(userDetails.getPassword());
            }

            userRepo.save(user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Integer id) {
        userRepo.deleteById(id);
    }

}