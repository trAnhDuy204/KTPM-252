package com.hotel.backend.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.auth.controller.AuthController;
import com.hotel.backend.auth.dto.AuthDto;
import com.hotel.backend.auth.entity.Role;
import com.hotel.backend.auth.exception.AuthException;
import com.hotel.backend.auth.service.AuthService;
import com.hotel.backend.auth.service.CustomUserDetailsService;
import com.hotel.backend.config.SecurityConfig;
import com.hotel.backend.security.JwtService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean AuthService authService;
    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    private final AuthDto.AuthResponse mockAuthResponse = AuthDto.AuthResponse.builder()
            .accessToken("access-token")
            .refreshToken("refresh-token")
            .tokenType("Bearer")
            .user(AuthDto.UserInfo.builder()
                    .id(1L).fullName("Test User").email("test@test.com")
                    .role(Role.CUSTOMER).build())
            .build();

     // POST /api/auth/register
    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("201 on valid registration")
        void register_201() throws Exception {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Test User").email("test@test.com")
                    .password("Password1").phone("0901234567").build();

            when(authService.register(any())).thenReturn(mockAuthResponse);

            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.accessToken").value("access-token"))
                    .andExpect(jsonPath("$.user.role").value("CUSTOMER"));
        }

        @Test
        @DisplayName("400 when email is blank")
        void register_blankEmail_400() throws Exception {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Test").email("").password("Password1").build();

            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("400 when password too short")
        void register_shortPassword_400() throws Exception {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Test").email("test@test.com").password("abc").build();

            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("401 when email already exists")
        void register_duplicateEmail_401() throws Exception {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Test").email("dup@test.com").password("Password1").build();

            when(authService.register(any()))
                    .thenThrow(new AuthException("Email already in use"));

            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Email already in use"));
        }
    }
    // POST /api/auth/login
    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginEndpoint {

        @Test
        @DisplayName("200 on valid login")
        void login_200() throws Exception {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("test@test.com").password("Password1").build();

            when(authService.login(any())).thenReturn(mockAuthResponse);

            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.user.email").value("test@test.com"));
        }

        @Test
        @DisplayName("401 on wrong credentials")
        void login_badCredentials_401() throws Exception {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("bad@test.com").password("Wrong").build();

            when(authService.login(any()))
                    .thenThrow(new AuthException("Invalid email or password"));

            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        @Test
        @DisplayName("400 on invalid email format")
        void login_invalidEmail_400() throws Exception {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("not-an-email").password("Password1").build();

            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }
    }

    // POST /api/auth/refresh
    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshEndpoint {

        @Test
        @DisplayName("200 on valid refresh token")
        void refresh_200() throws Exception {
            AuthDto.RefreshRequest req = new AuthDto.RefreshRequest("valid-token");
            when(authService.refreshToken(any())).thenReturn(mockAuthResponse);

            mockMvc.perform(post("/api/auth/refresh")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token"));
        }
    }

    // POST /api/admin/staff
    @Nested
    @DisplayName("POST /api/auth/admin/staff")
    class CreateStaffEndpoint {

        @Test
        @DisplayName("201 when admin creates reception staff")
        @WithMockUser(roles = "ADMIN")
        void createStaff_201() throws Exception {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Reception").email("rec@hotel.com")
                    .password("Password1").role(Role.RECEPTION).hotelId(1L).build();

            AuthDto.UserInfo info = AuthDto.UserInfo.builder()
                    .id(5L).fullName("Reception").email("rec@hotel.com")
                    .role(Role.RECEPTION).hotelId(1L).build();

            when(authService.createStaff(any())).thenReturn(info);

            mockMvc.perform(post("/api/auth/admin/staff")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.role").value("RECEPTION"))
                    .andExpect(jsonPath("$.hotelId").value(1));
        }

        @Test
        @DisplayName("403 when non-admin tries to create staff")
        @WithMockUser(roles = "CUSTOMER")
        void createStaff_forbidden_403() throws Exception {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Hacker").email("hack@test.com")
                    .password("Password1").role(Role.ADMIN).build();

            mockMvc.perform(post("/api/auth/admin/staff")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isForbidden());
        }
    }
}