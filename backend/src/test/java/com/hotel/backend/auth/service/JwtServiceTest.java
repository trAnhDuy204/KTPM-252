package com.hotel.backend.auth.service;

import com.hotel.backend.auth.entity.Role;
import com.hotel.backend.auth.entity.User;
import com.hotel.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtService Tests")
class JwtServiceTest {

    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604800000L);

        testUser = User.builder()
                .id(1L).email("test@test.com")
                .password("encoded").role(Role.CUSTOMER).build();
    }

    @Test
    @DisplayName("Should generate non-null access token")
    void generateToken_notNull() {
        String token = jwtService.generateToken(testUser);
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("Should generate non-null refresh token")
    void generateRefreshToken_notNull() {
        String token = jwtService.generateRefreshToken(testUser);
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("Should extract correct username from token")
    void extractUsername_correct() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.extractUsername(token)).isEqualTo("test@test.com");
    }

    @Test
    @DisplayName("Should validate token for correct user")
    void isTokenValid_true() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.isTokenValid(token, testUser)).isTrue();
    }

    @Test
    @DisplayName("Should invalidate token for different user")
    void isTokenValid_differentUser_false() {
        String token = jwtService.generateToken(testUser);
        User other = User.builder().email("other@test.com")
                .password("x").role(Role.ADMIN).build();
        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    @DisplayName("Should return expired for token with zero expiration")
    void isTokenExpired_zero_expired() {
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 0L);
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.isTokenExpired(token)).isTrue();
    }

    @Test
    @DisplayName("Access and refresh tokens should differ")
    void accessAndRefresh_areDifferent() {
        String access = jwtService.generateToken(testUser);
        String refresh = jwtService.generateRefreshToken(testUser);
        assertThat(access).isNotEqualTo(refresh);
    }
}