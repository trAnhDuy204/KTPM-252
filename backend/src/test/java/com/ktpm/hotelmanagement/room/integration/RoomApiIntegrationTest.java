package com.ktpm.hotelmanagement.room.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ktpm.hotelmanagement.hotel.entity.Hotel;
import com.ktpm.hotelmanagement.hotel.repository.HotelRepository;
import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import com.ktpm.hotelmanagement.room.entity.RoomType;
import com.ktpm.hotelmanagement.room.repository.RoomRepository;
import com.ktpm.hotelmanagement.room.repository.RoomTypeRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RoomApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EntityManager entityManager;

    private Hotel hotel;
    private RoomType roomType;

    @BeforeEach
    void setUp() {
        roomRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();

        hotel = new Hotel();
        hotel.setName("Test Hotel");
        hotel.setAddress("123 Test St");
        hotel.setCity("Test City");
        hotel = hotelRepository.save(hotel);

        roomType = new RoomType();
        roomType.setHotel(hotel);
        roomType.setName("Standard");
        roomType.setCapacity(2);
        roomType.setBasePrice(new BigDecimal("500000"));
        roomType = roomTypeRepository.save(roomType);

        entityManager.flush();
    }

    // ==================== CREATE ROOM ====================

    @Nested
    class CreateRoom {

        @Test
        void shouldCreateRoomAndReturnCreated() throws Exception {
            String body = """
                    {"hotelId": %d, "roomTypeId": %d, "roomNumber": "101"}
                    """.formatted(hotel.getId(), roomType.getId());

            mockMvc.perform(post("/api/reception/rooms")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.roomNumber").value("101"))
                    .andExpect(jsonPath("$.status").value("AVAILABLE"))
                    .andExpect(jsonPath("$.hotelId").value(hotel.getId()))
                    .andExpect(jsonPath("$.roomTypeId").value(roomType.getId()));

            assertThat(roomRepository.count()).isEqualTo(1);
        }

        @Test
        void shouldRejectDuplicateRoomNumber() throws Exception {
            createTestRoom("101", RoomStatus.AVAILABLE);

            String body = """
                    {"hotelId": %d, "roomTypeId": %d, "roomNumber": "101"}
                    """.formatted(hotel.getId(), roomType.getId());

            mockMvc.perform(post("/api/reception/rooms")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Room number already exists in this hotel"));
        }

        @Test
        void shouldRejectMissingRequiredFields() throws Exception {
            mockMvc.perform(post("/api/reception/rooms")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Validation failed"));
        }
    }

    // ==================== GET ROOMS ====================

    @Nested
    class GetRooms {

        @Test
        void shouldReturnAllRooms() throws Exception {
            createTestRoom("101", RoomStatus.AVAILABLE);
            createTestRoom("102", RoomStatus.OCCUPIED);

            mockMvc.perform(get("/api/reception/rooms"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        void shouldFilterByHotelId() throws Exception {
            createTestRoom("101", RoomStatus.AVAILABLE);

            mockMvc.perform(get("/api/reception/rooms")
                            .param("hotelId", hotel.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].hotelId").value(hotel.getId()));
        }

        @Test
        void shouldFilterByStatus() throws Exception {
            createTestRoom("101", RoomStatus.AVAILABLE);
            createTestRoom("102", RoomStatus.OCCUPIED);

            mockMvc.perform(get("/api/reception/rooms")
                            .param("status", "AVAILABLE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
        }

        @Test
        void shouldFilterByHotelIdAndStatus() throws Exception {
            createTestRoom("101", RoomStatus.AVAILABLE);
            createTestRoom("102", RoomStatus.OCCUPIED);

            mockMvc.perform(get("/api/reception/rooms")
                            .param("hotelId", hotel.getId().toString())
                            .param("status", "OCCUPIED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].roomNumber").value("102"));
        }
    }

    // ==================== GET ROOM BY ID ====================

    @Nested
    class GetRoom {

        @Test
        void shouldReturnRoomById() throws Exception {
            Room room = createTestRoom("101", RoomStatus.AVAILABLE);

            mockMvc.perform(get("/api/reception/rooms/{id}", room.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.roomNumber").value("101"));
        }

        @Test
        void shouldReturn404ForNonExistentRoom() throws Exception {
            mockMvc.perform(get("/api/reception/rooms/9999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== UPDATE STATUS ====================

    @Nested
    class UpdateStatus {

        @Test
        void shouldUpdateStatusWithValidTransition() throws Exception {
            Room room = createTestRoom("101", RoomStatus.AVAILABLE);

            mockMvc.perform(patch("/api/reception/rooms/{id}/status", room.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"RESERVED\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("RESERVED"));

            Room updated = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(RoomStatus.RESERVED);
        }

        @Test
        void shouldRejectInvalidTransition() throws Exception {
            Room room = createTestRoom("101", RoomStatus.OCCUPIED);

            mockMvc.perform(patch("/api/reception/rooms/{id}/status", room.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"AVAILABLE\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(
                            "Invalid room status transition from OCCUPIED to AVAILABLE"));
        }

        @Test
        void shouldReturnSameRoomWhenStatusUnchanged() throws Exception {
            Room room = createTestRoom("101", RoomStatus.AVAILABLE);

            mockMvc.perform(patch("/api/reception/rooms/{id}/status", room.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"AVAILABLE\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("AVAILABLE"));
        }

        @Test
        void shouldFollowFullStatusLifecycle() throws Exception {
            Room room = createTestRoom("101", RoomStatus.AVAILABLE);
            Integer id = room.getId();

            // AVAILABLE -> RESERVED
            mockMvc.perform(patch("/api/reception/rooms/{id}/status", id)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"RESERVED\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("RESERVED"));

            // RESERVED -> OCCUPIED
            mockMvc.perform(patch("/api/reception/rooms/{id}/status", id)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"OCCUPIED\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("OCCUPIED"));

            // OCCUPIED -> CLEANING
            mockMvc.perform(patch("/api/reception/rooms/{id}/status", id)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"CLEANING\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CLEANING"));

            // CLEANING -> AVAILABLE
            mockMvc.perform(patch("/api/reception/rooms/{id}/status", id)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"AVAILABLE\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("AVAILABLE"));
        }
    }

    // ==================== DELETE ROOM ====================

    @Nested
    class DeleteRoom {

        @Test
        void shouldDeleteRoom() throws Exception {
            Room room = createTestRoom("101", RoomStatus.AVAILABLE);

            mockMvc.perform(delete("/api/reception/rooms/{id}", room.getId()))
                    .andExpect(status().isNoContent());

            assertThat(roomRepository.findById(room.getId())).isEmpty();
        }

        @Test
        void shouldRejectDeleteOccupiedRoom() throws Exception {
            Room room = createTestRoom("101", RoomStatus.OCCUPIED);

            mockMvc.perform(delete("/api/reception/rooms/{id}", room.getId()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Cannot delete a room that is currently occupied"));
        }

        @Test
        void shouldReturn404WhenDeletingNonExistentRoom() throws Exception {
            mockMvc.perform(delete("/api/reception/rooms/9999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== LOOKUP ====================

    @Nested
    class Lookup {

        @Test
        void shouldReturnHotels() throws Exception {
            mockMvc.perform(get("/api/reception/hotels"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].name").value("Test Hotel"));
        }

        @Test
        void shouldReturnRoomTypesByHotelId() throws Exception {
            mockMvc.perform(get("/api/reception/room-types")
                            .param("hotelId", hotel.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].name").value("Standard"))
                    .andExpect(jsonPath("$[0].capacity").value(2));
        }
    }

    // ==================== Helper ====================

    private Room createTestRoom(String roomNumber, RoomStatus status) {
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber(roomNumber);
        room.setStatus(status);
        room = roomRepository.save(room);
        entityManager.flush();
        return room;
    }
}
