package com.hotel.backend.customer.service;

import com.hotel.backend.customer.dto.ProfileDto;
import com.hotel.backend.auth.entity.*;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.auth.exception.AuthException;
import com.hotel.backend.auth.repository.*;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.hotel.repository.HotelRepository;
import com.hotel.backend.room.repository.RoomRepository;
import com.hotel.backend.room.repository.RoomTypeRepository;
import com.hotel.backend.review.respository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository     userRepository;
    private final BookingRepository  bookingRepository;
    private final HotelRepository    hotelRepository;
    private final RoomRepository     roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final ReviewRepository   reviewRepository;
    private final PasswordEncoder    passwordEncoder;

    private static final DateTimeFormatter DATE_FMT     = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Lấy thông tin hồ sơ
    @Transactional(readOnly = true)
    public ProfileDto.ProfileResponse getProfile(Integer userId) {
        User user = findUser(userId);
        return toProfileResponse(user);
    }

    //Cập nhật hồ sơ
    @Transactional
    public ProfileDto.ProfileResponse updateProfile(Integer userId,
                                                    ProfileDto.UpdateProfileRequest req) {
        User user = findUser(userId);
        user.setFullName(req.getFullName().trim());
        user.setPhone(req.getPhone() != null ? req.getPhone().trim() : null);
        return toProfileResponse(userRepository.save(user));
    }

    // Đổi mật khẩu
    @Transactional
    public void changePassword(Integer userId, ProfileDto.ChangePasswordRequest req) {
        User user = findUser(userId);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new AuthException("Mật khẩu hiện tại không đúng");
        }

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new AuthException("Mật khẩu mới và xác nhận không khớp");
        }

        if (passwordEncoder.matches(req.getNewPassword(), user.getPassword())) {
            throw new AuthException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // Lịch sử booking
    @Transactional(readOnly = true)
    public List<ProfileDto.BookingItem> getBookingHistory(Integer userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (bookings.isEmpty()) return List.of();

        // Preload hotels, rooms, roomTypes
        Map<Integer, Hotel>    hotels    = preloadHotels(bookings);
        Map<Integer, Room>     rooms     = preloadRooms(bookings);
        Map<Integer, RoomType> roomTypes = preloadRoomTypes(rooms);

        return bookings.stream()
                .map(b -> toBookingItem(b, hotels, rooms, roomTypes, userId))
                .collect(Collectors.toList());
    }

    //  Thống kê booking
    @Transactional(readOnly = true)
    public ProfileDto.BookingSummary getBookingSummary(Integer userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return ProfileDto.BookingSummary.builder()
                .total(bookings.size())
                .pending  ((int) bookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count())
                .confirmed((int) bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count())
                .checkedIn((int) bookings.stream().filter(b -> b.getStatus() == BookingStatus.CHECKED_IN).count())
                .completed((int) bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count())
                .cancelled((int) bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count())
                .build();
    }

    // Private helpers
    private User findUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow();
    }

    private ProfileDto.ProfileResponse toProfileResponse(User user) {
        return ProfileDto.ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null
                        ? user.getCreatedAt().format(DATETIME_FMT) : null)
                .build();
    }

    private ProfileDto.BookingItem toBookingItem(Booking b,
                                                  Map<Integer, Hotel>    hotels,
                                                  Map<Integer, Room>     rooms,
                                                  Map<Integer, RoomType> roomTypes,
                                                  Integer userId) {
        Hotel    hotel    = hotels.get(b.getHotel().getId());
        Room     room     = rooms.get(b.getRoom().getId());
        RoomType roomType = room != null ? roomTypes.get(room.getRoomType().getId()) : null;

        boolean canReview = b.getStatus() == BookingStatus.COMPLETED
                && !reviewRepository.existsByBookingIdAndUserId(b.getId(), userId);

        return ProfileDto.BookingItem.builder()
                .id(b.getId())
                .hotelName  (hotel    != null ? hotel.getName()      : "Khách sạn #" + b.getHotel().getId())
                .hotelCity  (hotel    != null ? hotel.getCity()       : "—")
                .roomNumber (room     != null ? room.getRoomNumber()  : "Phòng #" + b.getRoom().getId())
                .roomTypeName(roomType != null ? roomType.getName()   : "—")
                .checkIn    (b.getCheckIn() .format(DATE_FMT))
                .checkOut   (b.getCheckOut().format(DATE_FMT))
                .totalPrice (b.getTotalPrice())
                .status     (b.getStatus().name())
                .createdAt  (b.getCreatedAt() != null ? b.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime().format(DATETIME_FMT) : null)
                .canReview  (canReview)
                .build();
    }

    private Map<Integer, Hotel> preloadHotels(List<Booking> bookings) {
        List<Integer> ids = bookings.stream().map(b -> b.getHotel().getId()).distinct().toList();
        return hotelRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Hotel::getId, Function.identity()));
    }

    private Map<Integer, Room> preloadRooms(List<Booking> bookings) {
        List<Integer> ids = bookings.stream().map(b -> b.getRoom().getId()).filter(id -> id != null).distinct().toList();
        return roomRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Room::getId, Function.identity()));
    }

    private Map<Integer, RoomType> preloadRoomTypes(Map<Integer, Room> rooms) {
        List<Integer> ids = rooms.values().stream().map(room -> room.getRoomType().getId()).filter(id -> id != null).distinct().toList();
        return roomTypeRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(RoomType::getId, Function.identity()));
    }
}