package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private HotelRepository hotelRepo; // Dùng 1 cái duy nhất cho gọn

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
    public ResponseEntity<?> addHotel(@RequestBody Hotel hotel) {
        // 1. Cắt khoảng trắng dư thừa
        String name = hotel.getName() != null ? hotel.getName().trim() : null;
        String city = hotel.getCity() != null ? hotel.getCity().trim() : null;
        String address = hotel.getAddress() != null ? hotel.getAddress().trim() : null;

        if (name == null || city == null || address == null || name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ thông tin!"));
        }

        // 2. Kiểm tra trùng (không phân biệt hoa thường)
        if (hotelRepo.existsByNameIgnoreCaseAndCityIgnoreCaseAndAddressIgnoreCase(name, city, address)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách sạn này đã tồn tại trên hệ thống!"));
        }

        hotel.setName(name);
        hotel.setCity(city);
        hotel.setAddress(address);
        return ResponseEntity.ok(hotelRepo.save(hotel));
    }


    @PutMapping("/hotels/{id}")
    public ResponseEntity<?> updateHotel(@PathVariable Integer id, @RequestBody Hotel hotelDetails) {
        return hotelRepo.findById(id).map(hotel -> {
            String name = hotelDetails.getName() != null ? hotelDetails.getName().trim() : null;
            String city = hotelDetails.getCity() != null ? hotelDetails.getCity().trim() : null;
            String address = hotelDetails.getAddress() != null ? hotelDetails.getAddress().trim() : null;

            if (name == null || city == null || address == null || name.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ thông tin!"));
            }

            // Kiểm tra trùng với bất kỳ khách sạn nào KHÁC (id khác)
            if (hotelRepo.existsDuplicate(name, city, address, id)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Thông tin cập nhật bị trùng với một khách sạn khác!"));
            }

            hotel.setName(name);
            hotel.setCity(city);
            hotel.setAddress(address);
            hotel.setDescription(hotelDetails.getDescription());
            return ResponseEntity.ok(hotelRepo.save(hotel));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/hotels/{id}")
    @Transactional
    public ResponseEntity<?> deleteHotel(@PathVariable Integer id) {
        // RÀNG BUỘC MỚI: Kiểm tra xem có phòng nào đang có khách (OCCUPIED) hoặc đã đặt
        // (BOOKED) không
        // Giả sử trạng thái trống là "AVAILABLE"
        boolean hasBusyRooms = roomRepo.existsByHotelIdAndStatusNot(id, "AVAILABLE");

        if (hasBusyRooms) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không thể xóa khách sạn vì đang có phòng có khách ở hoặc đang được đặt!"));
        }

        // Nếu tất cả phòng đều trống (AVAILABLE), tiến hành xóa
        roomRepo.deleteByHotelId(id);
        List<User> employees = userRepo.findByHotelId(id);
        for (User u : employees) {
            u.setHotelId(null);
            userRepo.save(u);
        }
        hotelRepo.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Đã xóa khách sạn và các phòng liên quan thành công!"));
    }

    // --- 2. QUẢN LÝ PHÒNG ---
    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomRepo.findAll();
    }

    @PostMapping("/rooms")
    public Room saveRoom(@RequestBody Room room) {
        return roomRepo.save(room);
    }

    @DeleteMapping("/rooms/{id}")
    public void deleteRoom(@PathVariable Integer id) {
        roomRepo.deleteById(id);
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Integer id, @RequestBody Room newRoom) {
        return roomRepo.findById(id).map(room -> {
            room.setRoomNumber(newRoom.getRoomNumber());
            room.setStatus(newRoom.getStatus());
            room.setRoomType(newRoom.getRoomType());
            if (newRoom.getHotelId() != null) {
                room.setHotelId(newRoom.getHotelId());
            }
            return ResponseEntity.ok(roomRepo.save(room));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- 3. CẤU HÌNH LOẠI PHÒNG & GIÁ ---

    @GetMapping("/room-types")
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepo.findAll();
    }

    @PostMapping("/room-types")
    public ResponseEntity<?> addRoomType(@RequestBody RoomType type) {
        // Kiểm tra giá
        if (type.getBasePrice() == null || type.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Giá phòng không hợp lệ!"));
        }

        // Kiểm tra sức chứa
        if (type.getCapacity() == null || type.getCapacity() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Sức chứa không hợp lệ!"));
        }

        // Kiểm tra trùng lặp toàn bộ các trường
        boolean isDuplicate = roomTypeRepo.existsByNameAndCapacityAndBasePriceAndDescription(
                type.getName(), type.getCapacity(), type.getBasePrice(), type.getDescription());

        if (isDuplicate) {
            return ResponseEntity.badRequest().body(Map.of("message", "Loại phòng với các thông tin này đã tồn tại!"));
        }

        return ResponseEntity.ok(roomTypeRepo.save(type));
    }

    @PutMapping("/room-types/{id}")
    public ResponseEntity<?> updateRoomType(@PathVariable Integer id, @RequestBody RoomType newType) {
        return roomTypeRepo.findById(id).map(type -> {
            if (newType.getBasePrice() == null || newType.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Giá phòng cập nhật không hợp lệ!"));
            }
            if (newType.getCapacity() == null || newType.getCapacity() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Sức chứa cập nhật không hợp lệ!"));
            }

            String name = newType.getName() != null ? newType.getName().trim() : null;
            if (name == null || name.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập tên loại phòng!"));
            }

            // Kiểm tra trùng lặp
            if (roomTypeRepo.existsByNameAndCapacityAndBasePriceAndDescriptionAndIdNot(
                    name, newType.getCapacity(), newType.getBasePrice(), newType.getDescription(), id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Loại phòng với các thông tin này đã tồn tại!"));
            }

            type.setName(name);
            type.setCapacity(newType.getCapacity());
            type.setBasePrice(newType.getBasePrice());
            type.setDescription(newType.getDescription());
            roomTypeRepo.save(type);
            return ResponseEntity.ok(Map.of("message", "Cập nhật loại phòng thành công!"));
        }).orElse(ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy loại phòng!")));
    }

    @DeleteMapping("/room-types/{id}")
    public ResponseEntity<?> deleteRoomType(@PathVariable Integer id) {
        if (roomRepo.existsByRoomType_Id(id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Loại phòng đang được sử dụng, không thể xóa!"));
        }
        roomTypeRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- 4. QUẢN LÝ TÀI KHOẢN LỄ TÂN ---
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (user.getFullName() == null || user.getEmail() == null ||
                user.getPhone() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ thông tin bắt buộc!"));
        }
        if (userRepo.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã tồn tại!"));
        }
        if (userRepo.existsByPhone(user.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại này đã tồn tại!"));
        }
        if (user.getRole() == null)
            user.setRole("RECEPTION");

        return ResponseEntity.ok(userRepo.save(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        return userRepo.findById(id).map(user -> {
            String email = userDetails.getEmail() != null ? userDetails.getEmail().trim() : null;
            String phone = userDetails.getPhone() != null ? userDetails.getPhone().trim() : null;

            if (userRepo.existsByEmailAndIdNot(email, id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email mới đã bị trùng!"));
            }
            if (userRepo.existsByPhoneAndIdNot(phone, id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại mới đã bị trùng!"));
            }

            user.setFullName(userDetails.getFullName() != null ? userDetails.getFullName().trim() : user.getFullName());
            user.setEmail(email);
            user.setPhone(phone);
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
