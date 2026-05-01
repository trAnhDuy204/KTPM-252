package com.hotel.backend.admin.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.admin.dto.AdminBookingDto;
import com.hotel.backend.admin.entity.AdminHotel;
import com.hotel.backend.admin.entity.AdminRoom;
import com.hotel.backend.admin.entity.AdminRoomType;
import com.hotel.backend.admin.entity.AdminUser;
import com.hotel.backend.admin.repository.AdminHotelRepository;
import com.hotel.backend.admin.repository.AdminRoomRepository;
import com.hotel.backend.admin.repository.AdminRoomTypeRepository;
import com.hotel.backend.admin.repository.AdminUserRepository;
import com.hotel.backend.admin.service.AdminBookingService;
import com.hotel.backend.auth.service.CustomUserDetailsService;
import com.hotel.backend.config.SecurityConfig;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.hotel.repository.HotelRepository;
import com.hotel.backend.security.JwtService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
@WithMockUser(roles = "ADMIN")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private HotelRepository hotelRepository;
    @MockitoBean private AdminHotelRepository hotelRepo;
    @MockitoBean private AdminRoomTypeRepository roomTypeRepo;
    @MockitoBean private AdminUserRepository userRepo;
    @MockitoBean private AdminRoomRepository roomRepo;
    @MockitoBean private AdminBookingService bookingService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    private static final String BASE_URL = "/api/admin";

    private AdminHotel sampleHotel(Integer id) {
        AdminHotel h = new AdminHotel();
        h.setId(id);
        h.setName("Grand Hotel");
        h.setCity("HCM");
        return h;
    }

    private Hotel sampleHotelEntity(Integer id) {
        Hotel h = new Hotel();
        h.setId(id);
        h.setName("Grand Hotel");
        h.setCity("HCM");
        h.setAddress("123 ABC");
        h.setDescription("Desc");
        return h;
    }

    private AdminRoom sampleRoom(Integer id) {
        AdminRoom r = new AdminRoom();
        r.setId(id);
        r.setRoomNumber("101");
        r.setStatus("AVAILABLE");
        r.setHotelId(1);
        return r;
    }

    private AdminRoomType sampleRoomType(Integer id) {
        AdminRoomType t = new AdminRoomType();
        t.setId(id);
        t.setName("Deluxe");
        t.setCapacity(2);
        t.setBasePrice(new BigDecimal("500000.0"));
        t.setDescription("Phòng Deluxe");
        return t;
    }

    private AdminUser sampleUser(Integer id, String email, String phone) {
        AdminUser u = new AdminUser();
        u.setId(id);
        u.setFullName("Nguyen Van A");
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword("secret");
        u.setRole("RECEPTION");
        return u;
    }
    
    // GET /api/admin/bookings
    @Nested
    class GetAllBookings {

        @Test
        void shouldReturnBookingList() throws Exception {
            when(bookingService.getAllBookings()).thenReturn(List.of(new AdminBookingDto()));

            mockMvc.perform(get(BASE_URL + "/bookings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void shouldReturnEmptyListWhenNoBookings() throws Exception {
            when(bookingService.getAllBookings()).thenReturn(List.of());

            mockMvc.perform(get(BASE_URL + "/bookings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "RECEPTION")
        void shouldReturn403WhenNotAdmin() throws Exception {
            mockMvc.perform(get(BASE_URL + "/bookings"))
                    .andExpect(status().isForbidden());
        }
    }

    // api/admin/hotels
    @Nested
    class HotelEndpoints {

        @Test
        void shouldReturnAllHotels() throws Exception {
            when(hotelRepo.findAll()).thenReturn(List.of(sampleHotel(1)));

            mockMvc.perform(get(BASE_URL + "/hotels"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name", is("Grand Hotel")));
        }

        @Test
        void shouldAddHotelSuccessfully() throws Exception {
            when(hotelRepo.save(any())).thenReturn(sampleHotel(1));

            mockMvc.perform(post(BASE_URL + "/hotels")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleHotel(null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.name", is("Grand Hotel")));
        }

        @Test
        void shouldUpdateHotelSuccessfully() throws Exception {
            Hotel updated = sampleHotelEntity(1);
            updated.setName("Updated Hotel");

            when(hotelRepository.findById(1)).thenReturn(Optional.of(sampleHotelEntity(1)));
            when(hotelRepository.save(any())).thenReturn(updated);

            mockMvc.perform(put(BASE_URL + "/hotels/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updated)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name", is("Updated Hotel")));
        }

        @Test
        void shouldReturn400WhenDeletingHotelWithEmployees() throws Exception {
            when(userRepo.existsByHotelId(1)).thenReturn(true);

            mockMvc.perform(delete(BASE_URL + "/hotels/1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Khách sạn đang có nhân viên làm việc, không thể xóa!")));
        }

        @Test
        void shouldReturn400WhenDeletingHotelWithActiveRooms() throws Exception {
            when(userRepo.existsByHotelId(1)).thenReturn(false);
            doThrow(DataIntegrityViolationException.class).when(hotelRepository).deleteById(1);

            mockMvc.perform(delete(BASE_URL + "/hotels/1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            is("Khách sạn này đang có phòng hoạt động. Vui lòng xóa hết phòng trước khi xóa khách sạn!")));
        }

        @Test
        void shouldDeleteHotelSuccessfully() throws Exception {
            when(userRepo.existsByHotelId(1)).thenReturn(false);
            doNothing().when(hotelRepository).deleteById(1);

            mockMvc.perform(delete(BASE_URL + "/hotels/1"))
                    .andExpect(status().isOk());
        }
    }

    // api/admin/rooms
    @Nested
    class RoomEndpoints {

        @Test
        void shouldReturnAllRooms() throws Exception {
            when(roomRepo.findAll()).thenReturn(List.of(sampleRoom(1)));

            mockMvc.perform(get(BASE_URL + "/rooms"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].roomNumber", is("101")));
        }

        @Test
        void shouldSaveRoomSuccessfully() throws Exception {
            when(roomRepo.save(any())).thenReturn(sampleRoom(1));

            mockMvc.perform(post(BASE_URL + "/rooms")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleRoom(null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)));
        }

        @Test
        void shouldUpdateRoomSuccessfully() throws Exception {
            AdminRoom updated = sampleRoom(1);
            updated.setRoomNumber("202");

            when(roomRepo.findById(1)).thenReturn(Optional.of(sampleRoom(1)));
            when(roomRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);

            mockMvc.perform(put(BASE_URL + "/rooms/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updated)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.roomNumber", is("202")));
        }

        @Test
        void shouldReturn500WhenRoomNotFoundOnUpdate() throws Exception {
            when(roomRepo.findById(99)).thenReturn(Optional.empty());

            mockMvc.perform(put(BASE_URL + "/rooms/99")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleRoom(99))))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        void shouldDeleteRoomSuccessfully() throws Exception {
            doNothing().when(roomRepo).deleteById(1);

            mockMvc.perform(delete(BASE_URL + "/rooms/1"))
                    .andExpect(status().isOk());
        }
    }

    // api/admin/room-types
    @Nested
    class RoomTypeEndpoints {

        @Test
        void shouldReturnAllRoomTypes() throws Exception {
            when(roomTypeRepo.findAll()).thenReturn(List.of(sampleRoomType(1)));

            mockMvc.perform(get(BASE_URL + "/room-types"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name", is("Deluxe")));
        }

        @Test
        void shouldAddRoomTypeSuccessfully() throws Exception {
            when(roomTypeRepo.save(any())).thenReturn(sampleRoomType(1));

            mockMvc.perform(post(BASE_URL + "/room-types")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleRoomType(null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)));
        }

        @Test
        void shouldUpdateRoomTypeSuccessfully() throws Exception {
            AdminRoomType updated = sampleRoomType(1);
            updated.setName("Suite");

            when(roomTypeRepo.findById(1)).thenReturn(Optional.of(sampleRoomType(1)));
            when(roomTypeRepo.save(any())).thenAnswer(i -> i.getArguments()[0]);

            mockMvc.perform(put(BASE_URL + "/room-types/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updated)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name", is("Suite")));
        }

        @Test
        void shouldReturn500WhenDeletingRoomTypeInUse() throws Exception {
            when(roomRepo.existsByRoomType_Id(1)).thenReturn(true);

            mockMvc.perform(delete(BASE_URL + "/room-types/1"))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        void shouldDeleteRoomTypeSuccessfully() throws Exception {
            when(roomRepo.existsByRoomType_Id(1)).thenReturn(false);
            doNothing().when(roomTypeRepo).deleteById(1);

            mockMvc.perform(delete(BASE_URL + "/room-types/1"))
                    .andExpect(status().isOk());
        }
    }

    // api/admin/users
    @Nested
    class UserEndpoints {

        @Test
        void shouldReturnAllUsers() throws Exception {
            when(userRepo.findAll()).thenReturn(List.of(sampleUser(1, "a@x.com", "0901000001")));

            mockMvc.perform(get(BASE_URL + "/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].email", is("a@x.com")));
        }

        @Test
        void shouldCreateUserSuccessfully() throws Exception {
            when(userRepo.existsByEmail(any())).thenReturn(false);
            when(userRepo.existsByPhone(any())).thenReturn(false);
            when(userRepo.save(any())).thenReturn(sampleUser(5, "new@x.com", "0901999999"));

            mockMvc.perform(post(BASE_URL + "/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser(null, "new@x.com", "0901999999"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(5)));
        }

        @Test
        void shouldReturn400WhenMissingRequiredFields() throws Exception {
            AdminUser incomplete = new AdminUser();
            incomplete.setFullName("No Email");

            mockMvc.perform(post(BASE_URL + "/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(incomplete)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Vui lòng nhập đầy đủ thông tin bắt buộc!")));
        }

        @Test
        void shouldReturn400WhenEmailAlreadyExists() throws Exception {
            when(userRepo.existsByEmail("dup@x.com")).thenReturn(true);

            mockMvc.perform(post(BASE_URL + "/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser(null, "dup@x.com", "0901000002"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Email này đã tồn tại trên hệ thống!")));
        }

        @Test
        void shouldReturn400WhenPhoneAlreadyExists() throws Exception {
            when(userRepo.existsByEmail(any())).thenReturn(false);
            when(userRepo.existsByPhone("0901111111")).thenReturn(true);

            mockMvc.perform(post(BASE_URL + "/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser(null, "unique@x.com", "0901111111"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Số điện thoại này đã tồn tại!")));
        }

        @Test
        void shouldUpdateUserSuccessfully() throws Exception {
            AdminUser existing = sampleUser(1, "old@x.com", "0900000001");
            AdminUser updated  = sampleUser(1, "new@x.com", "0900000002");

            when(userRepo.findById(1)).thenReturn(Optional.of(existing));
            when(userRepo.existsByEmail("new@x.com")).thenReturn(false);
            when(userRepo.existsByPhone("0900000002")).thenReturn(false);
            when(userRepo.save(any())).thenReturn(existing);

            mockMvc.perform(put(BASE_URL + "/users/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updated)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", is("Cập nhật thành công!")));
        }

        @Test
        void shouldReturn400WhenNewEmailIsDuplicate() throws Exception {
            AdminUser existing = sampleUser(1, "old@x.com", "0900000001");
            AdminUser updated  = sampleUser(1, "taken@x.com", "0900000001");

            when(userRepo.findById(1)).thenReturn(Optional.of(existing));
            when(userRepo.existsByEmail("taken@x.com")).thenReturn(true);

            mockMvc.perform(put(BASE_URL + "/users/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updated)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Email mới đã bị trùng với nhân viên khác!")));
        }

        @Test
        void shouldReturn404WhenUserNotFoundOnUpdate() throws Exception {
            when(userRepo.findById(99)).thenReturn(Optional.empty());

            mockMvc.perform(put(BASE_URL + "/users/99")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser(99, "x@x.com", "0900000099"))))
                    .andExpect(status().isNotFound());
        }

        @Test
        void shouldDeleteUserSuccessfully() throws Exception {
            doNothing().when(userRepo).deleteById(1);

            mockMvc.perform(delete(BASE_URL + "/users/1"))
                    .andExpect(status().isOk());
        }
    }

    // Authorization
    @Nested
    class Authorization {

        @Test
        @WithMockUser(roles = "RECEPTION")
        void shouldReturn403WhenNotAdmin() throws Exception {
            mockMvc.perform(get(BASE_URL + "/hotels"))
                    .andExpect(status().isForbidden());
        }
    }
}