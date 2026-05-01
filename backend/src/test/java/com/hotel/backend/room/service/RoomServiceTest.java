package com.hotel.backend.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hotel.backend.common.BusinessRuleException;
import com.hotel.backend.common.ResourceNotFoundException;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.room.dto.CreateRoomRequest;
import com.hotel.backend.room.dto.RoomResponse;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomRepository;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private EntityManager entityManager;

    private RoomService roomService;

    private Hotel hotel;
    private RoomType roomType;

    @BeforeEach
    void setUp() {
        roomService = new RoomService(roomRepository, entityManager);

        hotel = new Hotel();
        hotel.setId(1);

        roomType = new RoomType();
        roomType.setId(2);
        roomType.setName("Deluxe");
        roomType.setCapacity(2);
        roomType.setBasePrice(BigDecimal.valueOf(500000));
    }

    // ==================== CREATE ROOM ====================

    @Nested
    class CreateRoom {

        @Test
        void shouldCreateRoomWithDefaultStatusAvailable() {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "101", null);
            Room savedRoom = buildRoom(10, "101", RoomStatus.AVAILABLE);

            when(roomRepository.existsByHotel_IdAndRoomNumber(1, "101")).thenReturn(false);
            when(entityManager.getReference(Hotel.class, 1)).thenReturn(hotel);
            when(entityManager.getReference(RoomType.class, 2)).thenReturn(roomType);
            when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

            RoomResponse response = roomService.createRoom(request);

            assertThat(response.status()).isEqualTo(RoomStatus.AVAILABLE);
            assertThat(response.roomNumber()).isEqualTo("101");
            assertThat(response.hotelId()).isEqualTo(1);
            assertThat(response.roomTypeId()).isEqualTo(2);
            assertThat(response.basePrice()).isEqualTo("500000");
        }

        @Test
        void shouldCreateRoomWithExplicitStatus() {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "102", RoomStatus.MAINTENANCE);
            Room savedRoom = buildRoom(11, "102", RoomStatus.MAINTENANCE);

            when(roomRepository.existsByHotel_IdAndRoomNumber(1, "102")).thenReturn(false);
            when(entityManager.getReference(Hotel.class, 1)).thenReturn(hotel);
            when(entityManager.getReference(RoomType.class, 2)).thenReturn(roomType);
            when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

            RoomResponse response = roomService.createRoom(request);

            assertThat(response.status()).isEqualTo(RoomStatus.MAINTENANCE);
            assertThat(response.basePrice()).isEqualTo("500000");
        }

        @Test
        void shouldTrimRoomNumberBeforeSaving() {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "  101  ", null);
            Room savedRoom = buildRoom(10, "101", RoomStatus.AVAILABLE);

            when(roomRepository.existsByHotel_IdAndRoomNumber(1, "101")).thenReturn(false);
            when(entityManager.getReference(Hotel.class, 1)).thenReturn(hotel);
            when(entityManager.getReference(RoomType.class, 2)).thenReturn(roomType);
            when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

            RoomResponse response = roomService.createRoom(request);

            assertThat(response.roomNumber()).isEqualTo("101");
        }

        @Test
        void shouldRejectDuplicateRoomNumberWithinSameHotel() {
            CreateRoomRequest request = new CreateRoomRequest(1, 2, "101", null);
            when(roomRepository.existsByHotel_IdAndRoomNumber(1, "101")).thenReturn(true);

            assertThatThrownBy(() -> roomService.createRoom(request))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("Room number already exists in this hotel");

            verify(roomRepository, never()).save(any());
        }
    }

    // ==================== GET ROOM ====================

    @Nested
    class GetRoom {

        @Test
        void shouldReturnRoomWhenExists() {
            Room room = buildRoom(10, "101", RoomStatus.AVAILABLE);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            RoomResponse response = roomService.getRoom(10);

            assertThat(response.id()).isEqualTo(10);
            assertThat(response.roomNumber()).isEqualTo("101");
            assertThat(response.basePrice()).isEqualTo("500000");
        }

        @Test
        void shouldThrowWhenRoomDoesNotExist() {
            when(roomRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> roomService.getRoom(99))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Room not found with id: 99");
        }
    }

    // ==================== GET ROOMS (filter) ====================

    @Nested
    class GetRooms {

        @Test
        void shouldReturnAllRoomsWhenNoFilter() {
            Room room1 = buildRoom(1, "101", RoomStatus.AVAILABLE);
            Room room2 = buildRoom(2, "102", RoomStatus.OCCUPIED);
            when(roomRepository.findAll()).thenReturn(List.of(room1, room2));

            List<RoomResponse> responses = roomService.getRooms(null, null);

            assertThat(responses).hasSize(2);
        }

        @Test
        void shouldFilterByHotelId() {
            Room room = buildRoom(1, "101", RoomStatus.AVAILABLE);
            when(roomRepository.findByHotel_Id(1)).thenReturn(List.of(room));

            List<RoomResponse> responses = roomService.getRooms(1, null);

            assertThat(responses).hasSize(1);
            assertThat(responses.get(0).hotelId()).isEqualTo(1);
        }

        @Test
        void shouldFilterByStatus() {
            Room room = buildRoom(1, "101", RoomStatus.CLEANING);
            when(roomRepository.findByStatus(RoomStatus.CLEANING)).thenReturn(List.of(room));

            List<RoomResponse> responses = roomService.getRooms(null, RoomStatus.CLEANING);

            assertThat(responses).hasSize(1);
            assertThat(responses.get(0).status()).isEqualTo(RoomStatus.CLEANING);
        }

        @Test
        void shouldFilterByHotelIdAndStatus() {
            Room room = buildRoom(1, "101", RoomStatus.AVAILABLE);
            when(roomRepository.findByHotel_IdAndStatus(1, RoomStatus.AVAILABLE))
                    .thenReturn(List.of(room));

            List<RoomResponse> responses = roomService.getRooms(1, RoomStatus.AVAILABLE);

            assertThat(responses).hasSize(1);
        }

        @Test
        void shouldReturnEmptyListWhenNoRoomsMatch() {
            when(roomRepository.findByStatus(RoomStatus.MAINTENANCE)).thenReturn(List.of());

            List<RoomResponse> responses = roomService.getRooms(null, RoomStatus.MAINTENANCE);

            assertThat(responses).isEmpty();
        }
    }

    // ==================== UPDATE ROOM STATUS ====================

    @Nested
    class UpdateRoomStatus {

        @Test
        void shouldReturnSameRoomWhenStatusUnchanged() {
            Room room = buildRoom(10, "101", RoomStatus.AVAILABLE);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            RoomResponse response = roomService.updateRoomStatus(10, RoomStatus.AVAILABLE);

            assertThat(response.status()).isEqualTo(RoomStatus.AVAILABLE);
            verify(roomRepository, never()).save(any());
        }

        // ---------- Valid transitions ----------

        @ParameterizedTest(name = "AVAILABLE -> {0}")
        @CsvSource({ "RESERVED", "OCCUPIED", "CLEANING", "MAINTENANCE" })
        void shouldAllowTransitionFromAvailable(RoomStatus target) {
            Room room = buildRoom(10, "101", RoomStatus.AVAILABLE);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(room)).thenReturn(room);

            RoomResponse response = roomService.updateRoomStatus(10, target);

            assertThat(response.status()).isEqualTo(target);
        }

        @ParameterizedTest(name = "RESERVED -> {0}")
        @CsvSource({ "AVAILABLE", "OCCUPIED", "MAINTENANCE" })
        void shouldAllowTransitionFromReserved(RoomStatus target) {
            Room room = buildRoom(10, "101", RoomStatus.RESERVED);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(room)).thenReturn(room);

            RoomResponse response = roomService.updateRoomStatus(10, target);

            assertThat(response.status()).isEqualTo(target);
        }

        @Test
        void shouldAllowTransitionFromOccupiedToCleaning() {
            Room room = buildRoom(10, "101", RoomStatus.OCCUPIED);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(room)).thenReturn(room);

            RoomResponse response = roomService.updateRoomStatus(10, RoomStatus.CLEANING);

            assertThat(response.status()).isEqualTo(RoomStatus.CLEANING);
        }

        @ParameterizedTest(name = "CLEANING -> {0}")
        @CsvSource({ "AVAILABLE", "MAINTENANCE" })
        void shouldAllowTransitionFromCleaning(RoomStatus target) {
            Room room = buildRoom(10, "101", RoomStatus.CLEANING);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(room)).thenReturn(room);

            RoomResponse response = roomService.updateRoomStatus(10, target);

            assertThat(response.status()).isEqualTo(target);
        }

        @Test
        void shouldAllowTransitionFromMaintenanceToAvailable() {
            Room room = buildRoom(10, "101", RoomStatus.MAINTENANCE);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(room)).thenReturn(room);

            RoomResponse response = roomService.updateRoomStatus(10, RoomStatus.AVAILABLE);

            assertThat(response.status()).isEqualTo(RoomStatus.AVAILABLE);
        }

        // ---------- Invalid transitions ----------

        @ParameterizedTest(name = "OCCUPIED -> {0} should be rejected")
        @CsvSource({ "AVAILABLE", "RESERVED", "MAINTENANCE" })
        void shouldRejectInvalidTransitionFromOccupied(RoomStatus target) {
            Room room = buildRoom(10, "101", RoomStatus.OCCUPIED);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> roomService.updateRoomStatus(10, target))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Invalid room status transition from OCCUPIED to " + target);
        }

        @ParameterizedTest(name = "MAINTENANCE -> {0} should be rejected")
        @CsvSource({ "RESERVED", "OCCUPIED", "CLEANING" })
        void shouldRejectInvalidTransitionFromMaintenance(RoomStatus target) {
            Room room = buildRoom(10, "101", RoomStatus.MAINTENANCE);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> roomService.updateRoomStatus(10, target))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Invalid room status transition from MAINTENANCE to " + target);
        }

        @Test
        void shouldRejectTransitionFromReservedToCleaning() {
            Room room = buildRoom(10, "101", RoomStatus.RESERVED);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> roomService.updateRoomStatus(10, RoomStatus.CLEANING))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Invalid room status transition from RESERVED to CLEANING");
        }

        @Test
        void shouldRejectTransitionFromCleaningToOccupied() {
            Room room = buildRoom(10, "101", RoomStatus.CLEANING);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> roomService.updateRoomStatus(10, RoomStatus.OCCUPIED))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Invalid room status transition from CLEANING to OCCUPIED");
        }

        @Test
        void shouldThrowWhenRoomNotFoundForStatusUpdate() {
            when(roomRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> roomService.updateRoomStatus(99, RoomStatus.CLEANING))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Room not found with id: 99");
        }
    }

    // ==================== DELETE ROOM ====================

    @Nested
    class DeleteRoom {

        @Test
        void shouldDeleteRoomWhenNotOccupied() {
            Room room = buildRoom(10, "101", RoomStatus.AVAILABLE);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            roomService.deleteRoom(10);

            verify(roomRepository).delete(room);
        }

        @Test
        void shouldRejectDeleteWhenRoomIsOccupied() {
            Room room = buildRoom(10, "101", RoomStatus.OCCUPIED);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> roomService.deleteRoom(10))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("Cannot delete a room that is currently occupied");

            verify(roomRepository, never()).delete(any());
        }

        @Test
        void shouldThrowWhenRoomNotFoundForDelete() {
            when(roomRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> roomService.deleteRoom(99))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Room not found with id: 99");
        }

        @ParameterizedTest(name = "Should allow delete when status is {0}")
        @CsvSource({ "AVAILABLE", "RESERVED", "CLEANING", "MAINTENANCE" })
        void shouldAllowDeleteForNonOccupiedStatuses(RoomStatus status) {
            Room room = buildRoom(10, "101", status);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            roomService.deleteRoom(10);

            verify(roomRepository).delete(room);
        }
    }

    // ==================== Helper ====================

    private Room buildRoom(Integer id, String roomNumber, RoomStatus status) {
        Room room = new Room();
        room.setId(id);
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber(roomNumber);
        room.setStatus(status);
        return room;
    }
}
