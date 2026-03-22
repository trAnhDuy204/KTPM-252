package com.hotel.backend.auth.dto;

import com.hotel.backend.auth.entity.Role;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDto {

    //Register
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RegisterRequest {

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                 message = "Password must contain uppercase, lowercase, and digit")
        private String password;

        @Pattern(regexp = "^(\\+?[0-9]{9,15})?$", message = "Phone number is invalid")
        private String phone;
    }

    //Login
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    //Create Staff (Admin only)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateStaffRequest {

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100)
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8)
        private String password;

        @Pattern(regexp = "^(\\+?[0-9]{9,15})?$", message = "Phone number is invalid")
        private String phone;

        @NotNull(message = "Role is required")
        private Role role;

        private Long hotelId; // required for RECEPTION
    }

    //Auth Response
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private UserInfo user;
    }

    //User Info (embedded in responses)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private Role role;
        private Long hotelId;
    }

    //Refresh Token
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RefreshRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    //API Error
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApiError {
        private int status;
        private String message;
        private Object errors;
    }
}