package com.hotel.backend.auth.service;

import com.hotel.backend.auth.dto.AuthDto;
import com.hotel.backend.auth.entity.Role;
import com.hotel.backend.auth.entity.User;
import com.hotel.backend.auth.exception.AuthException;
import com.hotel.backend.auth.repository.UserRepository;
import com.hotel.backend.auth.service.AuthService;
import com.hotel.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private User sampleCustomer;
    private User sampleAdmin;
    private User sampleReception;

    @BeforeEach
    void setUp() {
        sampleCustomer = User.builder()
                .id(1L).fullName("Nguyen Van A").email("customer@test.com")
                .password("encoded").phone("0901234567")
                .role(Role.CUSTOMER).build();

        sampleAdmin = User.builder()
                .id(2L).fullName("Admin User").email("admin@test.com")
                .password("encoded").role(Role.ADMIN).build();

        sampleReception = User.builder()
                .id(3L).fullName("Le Thi B").email("reception@test.com")
                .password("encoded").role(Role.RECEPTION).hotelId(10L).build();
    }

    // REGISTER
    @Nested
    @DisplayName("register()")
    class RegisterTests {

        @Test
        @DisplayName("Should register customer successfully and return tokens")
        void register_success() {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Nguyen Van A").email("new@test.com")
                    .password("Password1").phone("0901234567").build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenReturn(sampleCustomer);
            when(jwtService.generateToken(any())).thenReturn("access-token");
            when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

            AuthDto.AuthResponse response = authService.register(req);

            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(response.getUser().getRole()).isEqualTo(Role.CUSTOMER);
            verify(userRepository).save(argThat(u -> u.getRole() == Role.CUSTOMER));
        }

        @Test
        @DisplayName("Should throw AuthException when email already exists")
        void register_duplicateEmail_throws() {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Test").email("existing@test.com")
                    .password("Password1").build();

            when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("Email already in use");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should always assign CUSTOMER role on self-registration")
        void register_alwaysCustomerRole() {
            AuthDto.RegisterRequest req = AuthDto.RegisterRequest.builder()
                    .fullName("Test").email("test@test.com").password("Password1").build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtService.generateToken(any())).thenReturn("token");
            when(jwtService.generateRefreshToken(any())).thenReturn("rtoken");

            authService.register(req);

            verify(userRepository).save(argThat(u -> u.getRole() == Role.CUSTOMER));
        }
    }

    // LOGIN
    @Nested
    @DisplayName("login()")
    class LoginTests {

        @Test
        @DisplayName("Should login customer and return tokens")
        void login_customer_success() {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("customer@test.com").password("Password1").build();

            when(userRepository.findByEmail("customer@test.com"))
                    .thenReturn(Optional.of(sampleCustomer));
            when(jwtService.generateToken(any())).thenReturn("access-token");
            when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

            AuthDto.AuthResponse response = authService.login(req);

            assertThat(response.getUser().getRole()).isEqualTo(Role.CUSTOMER);
            assertThat(response.getAccessToken()).isNotBlank();
        }

        @Test
        @DisplayName("Should login admin successfully")
        void login_admin_success() {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("admin@test.com").password("AdminPass1").build();

            when(userRepository.findByEmail("admin@test.com"))
                    .thenReturn(Optional.of(sampleAdmin));
            when(jwtService.generateToken(any())).thenReturn("admin-token");
            when(jwtService.generateRefreshToken(any())).thenReturn("admin-rtoken");

            AuthDto.AuthResponse response = authService.login(req);

            assertThat(response.getUser().getRole()).isEqualTo(Role.ADMIN);
        }

        @Test
        @DisplayName("Should throw AuthException on bad credentials")
        void login_badCredentials_throws() {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("bad@test.com").password("Wrong").build();

            doThrow(new BadCredentialsException("Bad credentials"))
                    .when(authenticationManager)
                    .authenticate(any(UsernamePasswordAuthenticationToken.class));

            assertThatThrownBy(() -> authService.login(req))
                    .isInstanceOf(AuthException.class)
                    .hasMessage("Invalid email or password");
        }

        @Test
        @DisplayName("Should login reception staff and include hotelId")
        void login_reception_includesHotelId() {
            AuthDto.LoginRequest req = AuthDto.LoginRequest.builder()
                    .email("reception@test.com").password("Pass1").build();

            when(userRepository.findByEmail("reception@test.com"))
                    .thenReturn(Optional.of(sampleReception));
            when(jwtService.generateToken(any())).thenReturn("token");
            when(jwtService.generateRefreshToken(any())).thenReturn("rtoken");

            AuthDto.AuthResponse response = authService.login(req);

            assertThat(response.getUser().getHotelId()).isEqualTo(10L);
        }
    }

    // REFRESH TOKEN
    @Nested
    @DisplayName("refreshToken()")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should return new tokens with valid refresh token")
        void refresh_success() {
            AuthDto.RefreshRequest req = new AuthDto.RefreshRequest("valid-refresh");

            when(jwtService.extractUsername("valid-refresh")).thenReturn("customer@test.com");
            when(userRepository.findByEmail("customer@test.com"))
                    .thenReturn(Optional.of(sampleCustomer));
            when(jwtService.isTokenValid("valid-refresh", sampleCustomer)).thenReturn(true);
            when(jwtService.generateToken(sampleCustomer)).thenReturn("new-access");
            when(jwtService.generateRefreshToken(sampleCustomer)).thenReturn("new-refresh");

            AuthDto.AuthResponse response = authService.refreshToken(req);

            assertThat(response.getAccessToken()).isEqualTo("new-access");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
        }

        @Test
        @DisplayName("Should throw AuthException when refresh token is expired")
        void refresh_expiredToken_throws() {
            AuthDto.RefreshRequest req = new AuthDto.RefreshRequest("expired-token");

            when(jwtService.extractUsername("expired-token")).thenReturn("customer@test.com");
            when(userRepository.findByEmail("customer@test.com"))
                    .thenReturn(Optional.of(sampleCustomer));
            when(jwtService.isTokenValid("expired-token", sampleCustomer)).thenReturn(false);

            assertThatThrownBy(() -> authService.refreshToken(req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("expired");
        }
    }

    // CREATE STAFF
    @Nested
    @DisplayName("createStaff()")
    class CreateStaffTests {

        @Test
        @DisplayName("Should create RECEPTION account with hotelId")
        void createStaff_reception_success() {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Reception").email("rec@hotel.com")
                    .password("Password1").role(Role.RECEPTION).hotelId(5L).build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any())).thenReturn(sampleReception);

            AuthDto.UserInfo info = authService.createStaff(req);

            assertThat(info.getRole()).isEqualTo(Role.RECEPTION);
            verify(userRepository).save(any());
        }

        @Test
        @DisplayName("Should create ADMIN account without hotelId")
        void createStaff_admin_success() {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Admin 2").email("admin2@sys.com")
                    .password("Password1").role(Role.ADMIN).build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any())).thenReturn(sampleAdmin);

            AuthDto.UserInfo info = authService.createStaff(req);

            assertThat(info.getRole()).isEqualTo(Role.ADMIN);
        }

        @Test
        @DisplayName("Should throw when RECEPTION created without hotelId")
        void createStaff_receptionWithoutHotel_throws() {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Reception").email("rec@hotel.com")
                    .password("Password1").role(Role.RECEPTION).hotelId(null).build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.createStaff(req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("Hotel ID is required");
        }

        @Test
        @DisplayName("Should throw when trying to create CUSTOMER via admin endpoint")
        void createStaff_customerRole_throws() {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Test").email("test@test.com")
                    .password("Password1").role(Role.CUSTOMER).build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.createStaff(req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("Cannot create CUSTOMER");
        }

        @Test
        @DisplayName("Should throw when email already in use")
        void createStaff_duplicateEmail_throws() {
            AuthDto.CreateStaffRequest req = AuthDto.CreateStaffRequest.builder()
                    .fullName("Admin").email("taken@test.com")
                    .password("Password1").role(Role.ADMIN).build();

            when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.createStaff(req))
                    .isInstanceOf(AuthException.class)
                    .hasMessageContaining("Email already in use");
        }
    }
}