package com.hotel.backend.customer.serviece;

import com.hotel.backend.customer.dto.ProfileDto;
import com.hotel.backend.customer.service.ProfileService;
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
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.List;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfileService Tests")
class ProfileServiceTest {

    @Mock private UserRepository     userRepository;
    @Mock private BookingRepository  bookingRepository;
    @Mock private HotelRepository    hotelRepository;
    @Mock private RoomRepository     roomRepository;
    @Mock private RoomTypeRepository roomTypeRepository;
    @Mock private ReviewRepository   reviewRepository;
    @Mock private PasswordEncoder    passwordEncoder;

    @InjectMocks private ProfileService profileService;

    private static final Integer USER_ID = 1;

    private User sampleUser() {
        return User.builder()
                .id(USER_ID).fullName("Nguyễn Văn A").email("a@test.com")
                .password("encoded_pass").phone("0901234567")
                .role(Role.CUSTOMER)
                .createdAt(LocalDateTime.of(2025, 1, 1, 10, 0))
                .build();
    }

    private Booking sampleBooking(BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(10);
        booking.setUserId(USER_ID);
        booking.setHotel(sampleHotel());
        booking.setRoom(sampleRoom());
        booking.setCheckIn(LocalDate.of(2025, 3, 10));
        booking.setCheckOut(LocalDate.of(2025, 3, 15));
        booking.setTotalPrice(new BigDecimal("2500000"));
        booking.setStatus(status);
        booking.setCreatedAt(LocalDateTime.of(2025, 2, 1, 12, 0).atZone(ZoneId.systemDefault()).toInstant());
        return booking;
    }

    private Hotel sampleHotel() {
        Hotel hotel = new Hotel();
        hotel.setId(5);
        hotel.setName("Grand Hotel");
        hotel.setCity("Hà Nội");
        hotel.setAddress("123 Phố Huế");
        return hotel;
    }

    private Room sampleRoom() {
        Room room = new Room();
        room.setId(3);
        room.setHotel(sampleHotel());
        room.setRoomType(sampleRoomType());
        room.setRoomNumber("301");
        return room;
    }

    private RoomType sampleRoomType() {
        RoomType roomType = new RoomType();
        roomType.setId(2);
        roomType.setName("Deluxe");
        roomType.setCapacity(2);
        roomType.setBasePrice(new BigDecimal("500000.00"));
        return roomType;
    }

    // getProfile()
    @Nested @DisplayName("getProfile()")
    class GetProfile {

        @Test @DisplayName("Trả về đúng thông tin user")
        void success() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(sampleUser()));

            ProfileDto.ProfileResponse res = profileService.getProfile(USER_ID);

            assertThat(res.getFullName()).isEqualTo("Nguyễn Văn A");
            assertThat(res.getEmail()).isEqualTo("a@test.com");
            assertThat(res.getPhone()).isEqualTo("0901234567");
            assertThat(res.getRole()).isEqualTo("CUSTOMER");
            assertThat(res.getCreatedAt()).isEqualTo("01/01/2025 10:00");
        }
    }

    // updateProfile()
    @Nested @DisplayName("updateProfile()")
    class UpdateProfile {

        @Test @DisplayName("Cập nhật fullName và phone thành công")
        void success() {
            User user = sampleUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            ProfileDto.UpdateProfileRequest req = ProfileDto.UpdateProfileRequest.builder()
                    .fullName("Trần Thị B").phone("0912345678").build();

            ProfileDto.ProfileResponse res = profileService.updateProfile(USER_ID, req);

            assertThat(res.getFullName()).isEqualTo("Trần Thị B");
            assertThat(res.getPhone()).isEqualTo("0912345678");
            verify(userRepository).save(any(User.class));
        }

        @Test @DisplayName("Cập nhật phone thành null vẫn thành công")
        void phoneNull() {
            User user = sampleUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            ProfileDto.UpdateProfileRequest req = ProfileDto.UpdateProfileRequest.builder()
                    .fullName("Nguyễn Văn A").phone(null).build();

            ProfileDto.ProfileResponse res = profileService.updateProfile(USER_ID, req);
            assertThat(res.getPhone()).isNull();
        }

        @Test @DisplayName("Trim khoảng trắng trong fullName")
        void trimFullName() {
            User user = sampleUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            ProfileDto.UpdateProfileRequest req = ProfileDto.UpdateProfileRequest.builder()
                    .fullName("  Nguyễn Văn C  ").phone(null).build();

            ProfileDto.ProfileResponse res = profileService.updateProfile(USER_ID, req);
            assertThat(res.getFullName()).isEqualTo("Nguyễn Văn C");
        }
    }

    // changePassword()
    @Nested @DisplayName("changePassword()")
    class ChangePassword {

        @Test @DisplayName("Đổi mật khẩu thành công")
        void success() {
            User user = sampleUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("oldPass", "encoded_pass")).thenReturn(true);
            when(passwordEncoder.matches("NewPass1", "encoded_pass")).thenReturn(false);
            when(passwordEncoder.encode("NewPass1")).thenReturn("new_encoded");

            ProfileDto.ChangePasswordRequest req = ProfileDto.ChangePasswordRequest.builder()
                    .currentPassword("oldPass")
                    .newPassword("NewPass1")
                    .confirmPassword("NewPass1")
                    .build();

            profileService.changePassword(USER_ID, req);
            verify(userRepository).save(argThat(u -> u.getPassword().equals("new_encoded")));
        }

        @Test @DisplayName("Ném AuthException khi mật khẩu hiện tại sai")
        void wrongCurrentPassword() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(sampleUser()));
            when(passwordEncoder.matches("wrongPass", "encoded_pass")).thenReturn(false);

            ProfileDto.ChangePasswordRequest req = ProfileDto.ChangePasswordRequest.builder()
                    .currentPassword("wrongPass")
                    .newPassword("NewPass1").confirmPassword("NewPass1").build();

            assertThatThrownBy(() -> profileService.changePassword(USER_ID, req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("không đúng");
        }

        @Test @DisplayName("Ném AuthException khi mật khẩu mới và xác nhận không khớp")
        void confirmMismatch() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(sampleUser()));
            when(passwordEncoder.matches("oldPass", "encoded_pass")).thenReturn(true);

            ProfileDto.ChangePasswordRequest req = ProfileDto.ChangePasswordRequest.builder()
                    .currentPassword("oldPass")
                    .newPassword("NewPass1").confirmPassword("NewPass2").build();

            assertThatThrownBy(() -> profileService.changePassword(USER_ID, req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("không khớp");
        }

        @Test @DisplayName("Ném AuthException khi mật khẩu mới trùng mật khẩu cũ")
        void samePassword() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(sampleUser()));
            when(passwordEncoder.matches("samePass", "encoded_pass")).thenReturn(true);

            ProfileDto.ChangePasswordRequest req = ProfileDto.ChangePasswordRequest.builder()
                    .currentPassword("samePass")
                    .newPassword("samePass").confirmPassword("samePass").build();

            assertThatThrownBy(() -> profileService.changePassword(USER_ID, req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("phải khác");
        }
    }

    // getBookingHistory()
    @Nested @DisplayName("getBookingHistory()")
    class GetBookingHistory {

        @Test @DisplayName("Trả về danh sách booking kèm thông tin hotel và phòng")
        void success() {
            Booking booking = sampleBooking(BookingStatus.COMPLETED);
            Hotel hotel     = sampleHotel();
            Room room       = sampleRoom();
            RoomType rt     = sampleRoomType();

            when(bookingRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of(booking));
            when(hotelRepository.findAllById(List.of(5))).thenReturn(List.of(hotel));
            when(roomRepository.findAllById(List.of(3))).thenReturn(List.of(room));
            when(roomTypeRepository.findAllById(List.of(2))).thenReturn(List.of(rt));
            when(reviewRepository.existsByBookingIdAndUserId(10, USER_ID)).thenReturn(false);

            List<ProfileDto.BookingItem> result = profileService.getBookingHistory(USER_ID);

            assertThat(result).hasSize(1);
            ProfileDto.BookingItem item = result.get(0);
            assertThat(item.getHotelName()).isEqualTo("Grand Hotel");
            assertThat(item.getHotelCity()).isEqualTo("Hà Nội");
            assertThat(item.getRoomNumber()).isEqualTo("301");
            assertThat(item.getRoomTypeName()).isEqualTo("Deluxe");
            assertThat(item.getStatus()).isEqualTo("COMPLETED");
            assertThat(item.isCanReview()).isTrue();
            assertThat(item.getCheckIn()).isEqualTo("10/03/2025");
            assertThat(item.getCheckOut()).isEqualTo("15/03/2025");
        }

        @Test @DisplayName("canReview = false khi booking COMPLETED nhưng đã review")
        void canReview_false_alreadyReviewed() {
            Booking booking = sampleBooking(BookingStatus.COMPLETED);
            when(bookingRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of(booking));
            when(hotelRepository.findAllById(any())).thenReturn(List.of(sampleHotel()));
            when(roomRepository.findAllById(any())).thenReturn(List.of(sampleRoom()));
            when(roomTypeRepository.findAllById(any())).thenReturn(List.of(sampleRoomType()));
            when(reviewRepository.existsByBookingIdAndUserId(10, USER_ID)).thenReturn(true);

            List<ProfileDto.BookingItem> result = profileService.getBookingHistory(USER_ID);
            assertThat(result.get(0).isCanReview()).isFalse();
        }

        @Test @DisplayName("canReview = false khi booking PENDING")
        void canReview_false_notCompleted() {
            Booking booking = sampleBooking(BookingStatus.PENDING);
            when(bookingRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of(booking));
            when(hotelRepository.findAllById(any())).thenReturn(List.of());
            when(roomRepository.findAllById(any())).thenReturn(List.of());
            when(roomTypeRepository.findAllById(any())).thenReturn(List.of());

            List<ProfileDto.BookingItem> result = profileService.getBookingHistory(USER_ID);
            assertThat(result.get(0).isCanReview()).isFalse();
        }

        @Test @DisplayName("Trả về danh sách rỗng khi chưa có booking")
        void empty() {
            when(bookingRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of());
            assertThat(profileService.getBookingHistory(USER_ID)).isEmpty();
        }
    }

    // getBookingSummary()
    @Nested @DisplayName("getBookingSummary()")
    class GetBookingSummary {

        @Test @DisplayName("Đếm đúng số lượng theo từng trạng thái")
        void correctCounts() {
            List<Booking> bookings = List.of(
                    sampleBooking(BookingStatus.PENDING),
                    sampleBooking(BookingStatus.PENDING),
                    sampleBooking(BookingStatus.CONFIRMED),
                    sampleBooking(BookingStatus.COMPLETED),
                    sampleBooking(BookingStatus.CANCELLED)
            );
            when(bookingRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(bookings);

            ProfileDto.BookingSummary s = profileService.getBookingSummary(USER_ID);

            assertThat(s.getTotal()).isEqualTo(5);
            assertThat(s.getPending()).isEqualTo(2);
            assertThat(s.getConfirmed()).isEqualTo(1);
            assertThat(s.getCompleted()).isEqualTo(1);
            assertThat(s.getCancelled()).isEqualTo(1);
            assertThat(s.getCheckedIn()).isEqualTo(0);
        }

        @Test @DisplayName("Trả về toàn 0 khi chưa có booking")
        void allZero() {
            when(bookingRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of());

            ProfileDto.BookingSummary s = profileService.getBookingSummary(USER_ID);
            assertThat(s.getTotal()).isEqualTo(0);
        }
    }
}
