package com.ktpm.hotelmanagement.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ktpm.hotelmanagement.common.BusinessRuleException;
import com.ktpm.hotelmanagement.common.ResourceNotFoundException;
import com.ktpm.hotelmanagement.room.dto.CreateRoomRequest;
import com.ktpm.hotelmanagement.room.dto.RoomResponse;
import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import com.ktpm.hotelmanagement.room.repository.RoomRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomService = new RoomService(roomRepository);
    }

    @Test
    void createRoomShouldDefaultStatusToAvailable() {
        CreateRoomRequest request = new CreateRoomRequest(1L, 2L, "101", null);
        Room savedRoom = buildRoom(10L, 1L, 2L, "101", RoomStatus.AVAILABLE);

        when(roomRepository.existsByHotelIdAndRoomNumber(1L, "101")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

        RoomResponse response = roomService.createRoom(request);

        assertThat(response.status()).isEqualTo(RoomStatus.AVAILABLE);
        assertThat(response.roomNumber()).isEqualTo("101");
    }

    @Test
    void createRoomShouldRejectDuplicateRoomNumberWithinHotel() {
        CreateRoomRequest request = new CreateRoomRequest(1L, 2L, "101", null);
        when(roomRepository.existsByHotelIdAndRoomNumber(1L, "101")).thenReturn(true);

        assertThatThrownBy(() -> roomService.createRoom(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Room number already exists in this hotel");
    }

    @Test
    void updateRoomStatusShouldAllowValidTransition() {
        Room room = buildRoom(10L, 1L, 2L, "101", RoomStatus.AVAILABLE);

        when(roomRepository.findById(10L)).thenReturn(Optional.of(room));
        when(roomRepository.save(room)).thenReturn(room);

        RoomResponse response = roomService.updateRoomStatus(10L, RoomStatus.RESERVED);

        assertThat(response.status()).isEqualTo(RoomStatus.RESERVED);
        verify(roomRepository).save(room);
    }

    @Test
    void updateRoomStatusShouldRejectInvalidTransition() {
        Room room = buildRoom(10L, 1L, 2L, "101", RoomStatus.OCCUPIED);
        when(roomRepository.findById(10L)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> roomService.updateRoomStatus(10L, RoomStatus.AVAILABLE))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Invalid room status transition from OCCUPIED to AVAILABLE");
    }

    @Test
    void getRoomShouldThrowWhenRoomDoesNotExist() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getRoom(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Room not found with id: 99");
    }

    private Room buildRoom(Long id, Long hotelId, Long roomTypeId, String roomNumber, RoomStatus status) {
        Room room = new Room();
        room.setId(id);
        room.setHotelId(hotelId);
        room.setRoomTypeId(roomTypeId);
        room.setRoomNumber(roomNumber);
        room.setStatus(status);
        return room;
    }
}
