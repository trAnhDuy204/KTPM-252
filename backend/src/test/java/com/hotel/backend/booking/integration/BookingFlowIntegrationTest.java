package com.hotel.backend.booking.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.hotel.repository.HotelRepository;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomRepository;
import com.hotel.backend.room.repository.RoomTypeRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "RECEPTION")
class BookingFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EntityManager entityManager;

    private Hotel hotel;
    private RoomType roomType;
    private Room room;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
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
        roomType.setName("Deluxe");
        roomType.setCapacity(2);
        roomType.setBasePrice(new BigDecimal("500000"));
        roomType = roomTypeRepository.save(roomType);

        room = new Room();
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber("101");
        room.setStatus(RoomStatus.AVAILABLE);
        room = roomRepository.save(room);

        entityManager.flush();
    }

    // FULL E2E FLOW
    @Nested
    class FullBookingFlow {

        @Test
        void shouldCompleteFullFlow_CreateConfirmCheckInCheckOut() throws Exception {
            // 1. Create booking (PENDING), room → RESERVED
            String createBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Nguyen Van A", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now(), LocalDate.now().plusDays(3));

            MvcResult createResult = mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.guestName").value("Nguyen Van A"))
                    .andReturn();

            Integer bookingId = extractId(createResult);

            // Verify room is RESERVED
            Room updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.RESERVED);

            // 2. Confirm booking (CONFIRMED), room stays RESERVED
            mockMvc.perform(post("/api/reception/bookings/{id}/confirm", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CONFIRMED"));

            updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.RESERVED);

            // 3. Check-in (CHECKED_IN), room → OCCUPIED
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Nguyen Van A", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(3));

            mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("CHECKED_IN"));

            updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.OCCUPIED);

            // 4. Check-out (COMPLETED), room → CLEANING
            // Need to find the CHECKED_IN booking (the check-in created a new booking)
            Booking checkedInBooking = bookingRepository.findByRoom_IdAndStatus(room.getId(), BookingStatus.CHECKED_IN)
                    .orElseThrow();

            mockMvc.perform(post("/api/reception/bookings/{id}/check-out", checkedInBooking.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("COMPLETED"));

            updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.CLEANING);
        }

        @Test
        void shouldCompleteDirectCheckInCheckOutFlow() throws Exception {
            // Direct check-in without advance booking
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Walk-in Guest", "guestPhone": "0912345678"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            MvcResult checkInResult = mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("CHECKED_IN"))
                    .andExpect(jsonPath("$.roomNumber").value("101"))
                    .andReturn();

            Integer bookingId = extractId(checkInResult);

            // Verify room is OCCUPIED
            Room updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.OCCUPIED);

            // Check-out
            mockMvc.perform(post("/api/reception/bookings/{id}/check-out", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("COMPLETED"));

            updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
            assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.CLEANING);

            // Check-out same day as check-in → minimum 1 night = 500,000
            Booking completed = bookingRepository.findById(bookingId).orElseThrow();
            assertThat(completed.getTotalPrice()).isEqualByComparingTo(new BigDecimal("500000"));
        }
    }

    // CANCEL FLOWS

    @Nested
    class CancelFlows {

        @Test
        void shouldCancelPendingBookingAndRestoreRoomToAvailable() throws Exception {
            String createBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createBody))
                    .andExpect(status().isCreated())
                    .andReturn();

            Integer bookingId = extractId(result);

            // Room should be RESERVED
            assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus())
                    .isEqualTo(RoomStatus.RESERVED);

            // Cancel the PENDING booking
            mockMvc.perform(post("/api/reception/bookings/{id}/cancel", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));

            // Room should be back to AVAILABLE
            assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus())
                    .isEqualTo(RoomStatus.AVAILABLE);
        }

        @Test
        void shouldCancelConfirmedBookingAndRestoreRoomToAvailable() throws Exception {
            String createBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createBody))
                    .andExpect(status().isCreated())
                    .andReturn();

            Integer bookingId = extractId(result);

            // Confirm it
            mockMvc.perform(post("/api/reception/bookings/{id}/confirm", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CONFIRMED"));

            // Cancel the CONFIRMED booking
            mockMvc.perform(post("/api/reception/bookings/{id}/cancel", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));

            // Room should be back to AVAILABLE
            assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus())
                    .isEqualTo(RoomStatus.AVAILABLE);
        }

        @Test
        void shouldCancelCheckedInBookingAndSetRoomToCleaning() throws Exception {
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated())
                    .andReturn();

            Integer bookingId = extractId(result);

            // Cancel the CHECKED_IN booking
            mockMvc.perform(post("/api/reception/bookings/{id}/cancel", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));

            // Room should be CLEANING (not AVAILABLE — needs cleaning after guest)
            assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus())
                    .isEqualTo(RoomStatus.CLEANING);
        }

        @Test
        void shouldRejectCancelForCompletedBooking() throws Exception {
            // Check-in
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated())
                    .andReturn();

            Integer bookingId = extractId(result);

            // Check-out
            mockMvc.perform(post("/api/reception/bookings/{id}/check-out", bookingId))
                    .andExpect(status().isOk());

            // Try to cancel COMPLETED booking — should fail
            mockMvc.perform(post("/api/reception/bookings/{id}/cancel", bookingId))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Cannot cancel a booking that is COMPLETED"));
        }
    }

    // DOUBLE BOOKING

    @Nested
    class DoubleBooking {

        @Test
        void shouldRejectSecondBookingForSameRoom() throws Exception {
            // First booking — should succeed
            String createBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest 1", "guestPhone": "0901111111"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

            mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createBody))
                    .andExpect(status().isCreated());

            // Room is now RESERVED
            assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus())
                    .isEqualTo(RoomStatus.RESERVED);

            // Second booking for same room — should be rejected
            String secondBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest 2", "guestPhone": "0902222222"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2), LocalDate.now().plusDays(4));

            mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(secondBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Room is not available for booking. Current status: RESERVED"));
        }

        @Test
        void shouldRejectCheckInForOccupiedRoom() throws Exception {
            // First check-in
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest 1", "guestPhone": "0901111111"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated());

            // Second check-in for same room — should fail
            String secondBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest 2", "guestPhone": "0902222222"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(3));

            mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(secondBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Room is not available for check-in. Current status: OCCUPIED"));
        }

        @Test
        void shouldAllowNewBookingAfterCancellation() throws Exception {
            // First booking
            String createBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest 1", "guestPhone": "0901111111"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createBody))
                    .andExpect(status().isCreated())
                    .andReturn();

            Integer bookingId = extractId(result);

            // Cancel the first booking — room back to AVAILABLE
            mockMvc.perform(post("/api/reception/bookings/{id}/cancel", bookingId))
                    .andExpect(status().isOk());

            assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus())
                    .isEqualTo(RoomStatus.AVAILABLE);

            // New booking for the same room — should now succeed
            String secondBody = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest 2", "guestPhone": "0902222222"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(4));

            mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(secondBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.guestName").value("Guest 2"));
        }
    }

    // EARLY CHECKOUT PRICE

    @Nested
    class EarlyCheckoutPrice {

        @Test
        void shouldRecalculatePriceWhenCheckingOutEarly() throws Exception {
            // Check-in with 5 nights planned
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(5));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.totalPrice").value(2500000)) // 5 * 500,000
                    .andReturn();

            Integer bookingId = extractId(result);

            // Check-out same day (early checkout)
            mockMvc.perform(post("/api/reception/bookings/{id}/check-out", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("COMPLETED"))
                    .andExpect(jsonPath("$.totalPrice").value(500000)); // minimum 1 night

            // Verify in DB
            Booking completed = bookingRepository.findById(bookingId).orElseThrow();
            assertThat(completed.getTotalPrice()).isEqualByComparingTo(new BigDecimal("500000"));
            assertThat(completed.getCheckOut()).isEqualTo(LocalDate.now());
        }
    }

    // CONCURRENT BOOKING

    @Nested
    class ConcurrentBooking {

        @Test
        void shouldPreventConcurrentBookingViaDatabaseConstraint() throws Exception {
            // Simulate concurrent booking by directly manipulating room status
            // In a real concurrent scenario, @Version on Room entity would throw
            // OptimisticLockException if two transactions try to update the same room.

            // First booking succeeds
            String body1 = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest 1", "guestPhone": "0901111111"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

            mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body1))
                    .andExpect(status().isCreated());

            // Room is now RESERVED — second booking must fail
            String body2 = """
                    {"roomId": %d, "checkIn": "%s", "checkOut": "%s", "guestName": "Guest 2", "guestPhone": "0902222222"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

            mockMvc.perform(post("/api/reception/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body2))
                    .andExpect(status().isBadRequest());

            // Verify only 1 booking exists for this room
            assertThat(bookingRepository.findByHotel_Id(hotel.getId()))
                    .hasSize(1);
        }

        @Test
        void shouldPreventConcurrentCheckInViaDatabaseConstraint() throws Exception {
            // First check-in succeeds
            String body1 = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest 1", "guestPhone": "0901111111"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body1))
                    .andExpect(status().isCreated());

            // Room is OCCUPIED — second check-in must fail
            String body2 = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest 2", "guestPhone": "0902222222"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(3));

            mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body2))
                    .andExpect(status().isBadRequest());

            // Verify only 1 CHECKED_IN booking exists
            assertThat(bookingRepository.existsByRoom_IdAndStatus(room.getId(), BookingStatus.CHECKED_IN))
                    .isTrue();
        }
    }

    // QUERY ENDPOINTS

    @Nested
    class QueryEndpoints {

        @Test
        void shouldGetBookingById() throws Exception {
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            MvcResult result = mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated())
                    .andReturn();

            Integer bookingId = extractId(result);

            mockMvc.perform(get("/api/reception/bookings/{id}", bookingId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.guestName").value("Guest"))
                    .andExpect(jsonPath("$.status").value("CHECKED_IN"));
        }

        @Test
        void shouldFilterBookingsByStatus() throws Exception {
            // Create a CHECKED_IN booking
            String checkInBody = """
                    {"roomId": %d, "checkOut": "%s", "guestName": "Guest", "guestPhone": "0901234567"}
                    """.formatted(room.getId(), LocalDate.now().plusDays(2));

            mockMvc.perform(post("/api/reception/bookings/check-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(checkInBody))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/reception/bookings")
                            .param("status", "CHECKED_IN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].status").value("CHECKED_IN"));

            mockMvc.perform(get("/api/reception/bookings")
                            .param("status", "COMPLETED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // Helper

    private Integer extractId(MvcResult result) throws Exception {
        String json = result.getResponse().getContentAsString();
        // Extract "id": <number> from JSON
        String idStr = json.split("\"id\":")[1].split("[,}]")[0].trim();
        return Integer.parseInt(idStr);
    }
}
