package com.hotel.backend.auth.controller;

import com.hotel.backend.auth.dto.AuthDto;
import com.hotel.backend.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /*POST /api/auth/register*/
    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @Valid @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    /*POST /api/auth/login*/ 
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /*POST /api/auth/refresh*/
    @PostMapping("/refresh")
    public ResponseEntity<AuthDto.AuthResponse> refresh(
            @Valid @RequestBody AuthDto.RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    /*POST /api/admin/staff*/
    @PostMapping("/admin/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthDto.UserInfo> createStaff(
            @Valid @RequestBody AuthDto.CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.createStaff(request));
    }
}