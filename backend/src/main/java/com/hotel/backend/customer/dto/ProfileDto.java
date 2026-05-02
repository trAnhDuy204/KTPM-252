package com.hotel.backend.customer.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

public class ProfileDto {

    // Xem thông tin hồ sơ
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProfileResponse {
        private Integer   id;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String createdAt; 
    }

    // Cập nhật hồ sơ
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateProfileRequest {

        @NotBlank(message = "Họ tên là bắt buộc")
        @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
        private String fullName;

        @Pattern(regexp = "^(\\+?[0-9]{9,15})?$", message = "Số điện thoại không hợp lệ")
        private String phone;
    }

    // Đổi mật khẩu
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChangePasswordRequest {

        @NotBlank(message = "Mật khẩu hiện tại là bắt buộc")
        private String currentPassword;

        @NotBlank(message = "Mật khẩu mới là bắt buộc")
        @Size(min = 8, message = "Mật khẩu mới tối thiểu 8 ký tự")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Mật khẩu cần có chữ hoa, chữ thường và số"
        )
        private String newPassword;

        @NotBlank(message = "Xác nhận mật khẩu là bắt buộc")
        private String confirmPassword;
    }

    // Booking item trong lịch sử
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BookingItem {
        private Integer    id;
        private String     hotelName;
        private String     hotelCity;
        private Integer    roomId;
        private String     roomNumber;
        private String     roomTypeName;
        private String     checkIn;   
        private String     checkOut;
        private BigDecimal totalPrice;
        private String     status;    
        private String     createdAt; 
        private boolean    canReview; 
    }

    // Tóm tắt thống kê booking
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BookingSummary {
        private int total;
        private int pending;
        private int confirmed;
        private int checkedIn;
        private int completed;
        private int cancelled;
    }
}
