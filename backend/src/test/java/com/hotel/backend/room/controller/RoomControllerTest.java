package com.hotel.backend.room.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.auth.service.CustomUserDetailsService;
import com.hotel.backend.common.BusinessRuleException;
import com.hotel.backend.common.ResourceNotFoundException;
import com.hotel.backend.config.SecurityConfig;
import com.hotel.backend.security.JwtService;
import com.hotel.backend.room.dto.CreateRoomRequest;
import com.hotel.backend.room.dto.RoomResponse;
import com.hotel.backend.room.dto.UpdateRoomStatusRequest;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.service.RoomService;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RoomController.class)
@Import(SecurityConfig.class)
@WithMockUser(roles = "RECEPTION")
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RoomService roomService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private static final String BASE_URL = "/api/reception/rooms";

    //POST /api/reception/rooms
    @Nested
    class CreateRoom {

        @Test
        void shouldReturn201WhenCreatingRoomSuccessfully() throws Exception {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "101", RoomStatus.AVAILABLE);
            RoomResponse response = new RoomResponse(10, 1, 2, "Standard", 2, "101", RoomStatus.AVAILABLE,"20","Hilton", "Da Nang");

            when(roomService.createRoom(any(CreateRoomRequest.class))).thenReturn(response);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", is(10)))
                    .andExpect(jsonPath("$.hotelId", is(1)))
                    .andExpect(jsonPath("$.roomTypeId", is(2)))
                    .andExpect(jsonPath("$.roomNumber", is("101")))
                    .andExpect(jsonPath("$.status", is("AVAILABLE")));
        }

        @Test
        void shouldReturn400WhenHotelIdIsNull() throws Exception {
            CreateRoomRequest request = new CreateRoomRequest(null, 2, "101", null);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.hotelId", is("hotelId is required")));
        }

        @Test
        void shouldReturn400WhenRoomTypeIdIsNull() throws Exception {
            CreateRoomRequest request = new CreateRoomRequest(1, null, "101", null);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.roomTypeId", is("roomTypeId is required")));
        }

        @Test
        void shouldReturn400WhenRoomNumberIsBlank() throws Exception {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "  ", null);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.roomNumber", is("roomNumber is required")));
        }

        @Test
        void shouldReturn400WhenAllRequiredFieldsMissing() throws Exception {
            String json = "{}";

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Validation failed")))
                    .andExpect(jsonPath("$.validationErrors.hotelId").exists())
                    .andExpect(jsonPath("$.validationErrors.roomTypeId").exists())
                    .andExpect(jsonPath("$.validationErrors.roomNumber").exists());
        }

        @Test
        void shouldReturn400WhenDuplicateRoomNumber() throws Exception {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "101", null);

            when(roomService.createRoom(any(CreateRoomRequest.class)))
                    .thenThrow(new BusinessRuleException("Room number already exists in this hotel"));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("Room number already exists in this hotel")));
        }
    }

    // GET /api/reception/rooms
    @Nested
    class GetRooms {

        @Test
        void shouldReturnAllRoomsWhenNoFilters() throws Exception {
            List<RoomResponse> rooms = List.of(
                    new RoomResponse(1, 1, 2, "Standard", 2, "101", RoomStatus.AVAILABLE,"20","Hilton", "Da Nang"),
                    new RoomResponse(2, 1, 2, "Standard", 2, "102", RoomStatus.OCCUPIED,"20","Hilton", "Da Nang")
            );

            when(roomService.getRooms(isNull(), isNull())).thenReturn(rooms);

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].roomNumber", is("101")))
                    .andExpect(jsonPath("$[1].roomNumber", is("102")));
        }

        @Test
        void shouldFilterByHotelId() throws Exception {
            List<RoomResponse> rooms = List.of(
                    new RoomResponse(1, 1, 2, "Standard", 2, "101", RoomStatus.AVAILABLE,"20","Hilton", "Da Nang")
            );

            when(roomService.getRooms(eq(1), isNull())).thenReturn(rooms);

            mockMvc.perform(get(BASE_URL).param("hotelId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].hotelId", is(1)));
        }

        @Test
        void shouldFilterByStatus() throws Exception {
            List<RoomResponse> rooms = List.of(
                    new RoomResponse(1, 1, 2, "Standard", 2, "101", RoomStatus.CLEANING,"20","Hilton", "Da Nang")
            );

            when(roomService.getRooms(isNull(), eq(RoomStatus.CLEANING))).thenReturn(rooms);

            mockMvc.perform(get(BASE_URL).param("status", "CLEANING"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].status", is("CLEANING")));
        }

        @Test
        void shouldFilterByHotelIdAndStatus() throws Exception {
            List<RoomResponse> rooms = List.of(
                    new RoomResponse(1, 1, 2, "Standard", 2, "101", RoomStatus.AVAILABLE,"20","Hilton", "Da Nang")
            );

            when(roomService.getRooms(eq(1), eq(RoomStatus.AVAILABLE))).thenReturn(rooms);

            mockMvc.perform(get(BASE_URL)
                            .param("hotelId", "1")
                            .param("status", "AVAILABLE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].hotelId", is(1)))
                    .andExpect(jsonPath("$[0].status", is("AVAILABLE")));
        }

        @Test
        void shouldReturnEmptyListWhenNoRoomsMatch() throws Exception {
            when(roomService.getRooms(eq(99), isNull())).thenReturn(List.of());

            mockMvc.perform(get(BASE_URL).param("hotelId", "99"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    //GET /api/reception/rooms/{roomId}
    @Nested
    class GetRoom {

        @Test
        void shouldReturn200WhenRoomExists() throws Exception {
            RoomResponse response = new RoomResponse(10, 1, 2, "Standard", 2, "101", RoomStatus.AVAILABLE,"20","Hilton", "Da Nang");

            when(roomService.getRoom(10)).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(10)))
                    .andExpect(jsonPath("$.hotelId", is(1)))
                    .andExpect(jsonPath("$.roomTypeId", is(2)))
                    .andExpect(jsonPath("$.roomNumber", is("101")))
                    .andExpect(jsonPath("$.status", is("AVAILABLE")));
        }

        @Test
        void shouldReturn404WhenRoomNotFound() throws Exception {
            when(roomService.getRoom(99))
                    .thenThrow(new ResourceNotFoundException("Room not found with id: 99"));

            mockMvc.perform(get(BASE_URL + "/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message", is("Room not found with id: 99")));
        }
    }

    //PATCH /api/reception/rooms/{roomId}/status
    @Nested
    class UpdateRoomStatus {

        @Test
        void shouldReturn200WhenStatusUpdateSuccessful() throws Exception {
            UpdateRoomStatusRequest request = new UpdateRoomStatusRequest(RoomStatus.OCCUPIED);
            RoomResponse response = new RoomResponse(10, 1, 2, "Standard", 2, "101", RoomStatus.OCCUPIED,"20","Hilton", "Da Nang");

            when(roomService.updateRoomStatus(eq(10), eq(RoomStatus.OCCUPIED))).thenReturn(response);

            mockMvc.perform(patch(BASE_URL + "/10/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(10)))
                    .andExpect(jsonPath("$.status", is("OCCUPIED")));
        }

        @Test
        void shouldReturn400WhenStatusIsNull() throws Exception {
            String json = "{}";

            mockMvc.perform(patch(BASE_URL + "/10/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.status", is("status is required")));
        }

        @Test
        void shouldReturn400WhenInvalidStatusTransition() throws Exception {
            UpdateRoomStatusRequest request = new UpdateRoomStatusRequest(RoomStatus.RESERVED);

            when(roomService.updateRoomStatus(eq(10), eq(RoomStatus.RESERVED)))
                    .thenThrow(new BusinessRuleException(
                            "Invalid room status transition from OCCUPIED to RESERVED"));

            mockMvc.perform(patch(BASE_URL + "/10/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message",
                            is("Invalid room status transition from OCCUPIED to RESERVED")));
        }

        @Test
        void shouldReturn404WhenRoomNotFoundForStatusUpdate() throws Exception {
            UpdateRoomStatusRequest request = new UpdateRoomStatusRequest(RoomStatus.CLEANING);

            when(roomService.updateRoomStatus(eq(99), eq(RoomStatus.CLEANING)))
                    .thenThrow(new ResourceNotFoundException("Room not found with id: 99"));

            mockMvc.perform(patch(BASE_URL + "/99/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message", is("Room not found with id: 99")));
        }
    }

    //Authorization
    @Nested
    class Authorization {

        @Test
        @WithAnonymousUser
        void shouldReturn401WhenUnauthenticated() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message", is("Authentication required")));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        void shouldReturn403WhenNotReceptionRole() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isForbidden());
        }
    }
}
