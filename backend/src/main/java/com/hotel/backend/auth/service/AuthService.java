package com.hotel.backend.auth.service;

import com.hotel.backend.auth.dto.AuthDto;
import com.hotel.backend.auth.entity.Role;
import com.hotel.backend.auth.entity.User;
import com.hotel.backend.auth.exception.AuthException;
import com.hotel.backend.auth.repository.UserRepository;
import com.hotel.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    //Register
    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .build();
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        userRepository.save(user);
        
        return buildAuthResponse(user);
    }

    //Login
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new AuthException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new AuthException("User not found"));

        return buildAuthResponse(user);
    }

    //Refresh Token
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshRequest request) {
        try {
            String email = jwtService.extractUsername(request.getRefreshToken());
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AuthException("User not found"));

            if (!jwtService.isTokenValid(request.getRefreshToken(), user)) {
                throw new AuthException("Refresh token expired or invalid");
            }

            return buildAuthResponse(user);
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Invalid refresh token");
        }
    }

    //Create Staff
    @Transactional
    public AuthDto.UserInfo createStaff(AuthDto.CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already in use: " + request.getEmail());
        }

        if (request.getRole() == Role.RECEPTION && request.getHotelId() == null) {
            throw new AuthException("Hotel ID is required for RECEPTION role");
        }

        if (request.getRole() == Role.CUSTOMER) {
            throw new AuthException("Cannot create CUSTOMER account via this endpoint");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .hotelId(request.getHotelId())
                .build();
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        User saved = userRepository.save(user);
        return mapToUserInfo(saved);
    }

    //Helpers
    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserInfo(user))
                .build();
    }

    public AuthDto.UserInfo mapToUserInfo(User user) {
        return AuthDto.UserInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .hotelId(user.getHotelId())
                .build();
    }
}