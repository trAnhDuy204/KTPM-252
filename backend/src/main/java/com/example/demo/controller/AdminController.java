package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private HotelRepository hotelRepo;
    @Autowired
    private RoomTypeRepository roomTypeRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private RoomRepository roomRepo; 

    // --- 1. QUẢN LÝ KHÁCH SẠN ---
    @GetMapping("/hotels")
    public List<Hotel> getAllHotels() {
        return hotelRepo.findAll();
    }

    @PostMapping("/hotels")
    public Hotel addHotel(@RequestBody Hotel hotel) {
        return hotelRepo.save(hotel);
    }

    // --- 2. QUẢN LÝ PHÒNG (Gộp Loại phòng & Giá) ---
    // Xem danh sách phòng kèm thông tin loại phòng và giá
    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomRepo.findAll();
    }

    // Thêm hoặc Sửa phòng 
    @PostMapping("/rooms")
    public Room saveRoom(@RequestBody Room room) {
        return roomRepo.save(room);
    }

    // Xóa phòng cụ thể (ID phòng)
    @DeleteMapping("/rooms/{id}")
    public void deleteRoom(@PathVariable Integer id) {
        roomRepo.deleteById(id);
    }

    @PutMapping("/rooms/{id}")
    public Room updateRoom(@PathVariable Integer id, @RequestBody Room newRoom) {
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
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepo.findAll();
    }

    // Thêm/Cập nhật cấu hình Loại phòng & Giá
    @PostMapping("/room-types")
    public RoomType addRoomType(@RequestBody RoomType type) {
        return roomTypeRepo.save(type);
    }

    @PutMapping("/room-types/{id}")
    public RoomType updateRoomType(@PathVariable Integer id, @RequestBody RoomType newType) {
        return roomTypeRepo.findById(id).map(type -> {
            type.setName(newType.getName());
            type.setCapacity(newType.getCapacity());
            type.setBasePrice(newType.getBasePrice());
            type.setDescription(newType.getDescription());
            return roomTypeRepo.save(type);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng id: " + id));
    }

    @DeleteMapping("/room-types/{id}")
    public void deleteRoomType(@PathVariable Integer id) {
        boolean isUsed = roomRepo.existsByRoomType_Id(id);
        if (isUsed) {
            throw new RuntimeException("Loại phòng đang được sử dụng, không thể xóa!");
        }

        roomTypeRepo.deleteById(id);
    }

    // --- 3. QUẢN LÝ TÀI KHOẢN LỄ TÂN ---
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // Tạo tài khoản mới 
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
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

        User savedUser = userRepo.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // Cập nhật tài khoản 
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
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
    public void deleteUser(@PathVariable Integer id) {
        userRepo.deleteById(id);
    }

}