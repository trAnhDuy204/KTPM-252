package com.ktpm.hotelmanagement.room.service;

import com.ktpm.hotelmanagement.common.BusinessRuleException;
import com.ktpm.hotelmanagement.common.ResourceNotFoundException;
import com.ktpm.hotelmanagement.room.dto.CreateRoomRequest;
import com.ktpm.hotelmanagement.room.dto.RoomResponse;
import com.ktpm.hotelmanagement.room.entity.Room;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import com.ktpm.hotelmanagement.room.repository.RoomRepository;
import jakarta.transaction.Transactional;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    private static final Map<RoomStatus, Set<RoomStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(RoomStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(RoomStatus.AVAILABLE,
                Set.of(RoomStatus.RESERVED, RoomStatus.OCCUPIED, RoomStatus.CLEANING, RoomStatus.MAINTENANCE));
        ALLOWED_TRANSITIONS.put(RoomStatus.RESERVED,
                Set.of(RoomStatus.AVAILABLE, RoomStatus.OCCUPIED, RoomStatus.MAINTENANCE));
        ALLOWED_TRANSITIONS.put(RoomStatus.OCCUPIED,
                Set.of(RoomStatus.CLEANING));
        ALLOWED_TRANSITIONS.put(RoomStatus.CLEANING,
                Set.of(RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE));
        ALLOWED_TRANSITIONS.put(RoomStatus.MAINTENANCE,
                Set.of(RoomStatus.AVAILABLE));
    }

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        String roomNumber = request.roomNumber().trim();
        if (roomRepository.existsByHotelIdAndRoomNumber(request.hotelId(), roomNumber)) {
            throw new BusinessRuleException("Room number already exists in this hotel");
        }

        Room room = new Room();
        room.setHotelId(request.hotelId());
        room.setRoomTypeId(request.roomTypeId());
        room.setRoomNumber(roomNumber);
        room.setStatus(request.status() == null ? RoomStatus.AVAILABLE : request.status());

        Room savedRoom = roomRepository.save(room);
        return RoomResponse.from(savedRoom);
    }

    public List<RoomResponse> getRooms(Long hotelId, RoomStatus status) {
        List<Room> rooms;
        if (hotelId != null && status != null) {
            rooms = roomRepository.findByHotelIdAndStatus(hotelId, status);
        } else if (hotelId != null) {
            rooms = roomRepository.findByHotelId(hotelId);
        } else if (status != null) {
            rooms = roomRepository.findByStatus(status);
        } else {
            rooms = roomRepository.findAll();
        }

        return rooms.stream().map(RoomResponse::from).toList();
    }

    public RoomResponse getRoom(Long roomId) {
        return RoomResponse.from(findRoom(roomId));
    }

    @Transactional
    public RoomResponse updateRoomStatus(Long roomId, RoomStatus targetStatus) {
        Room room = findRoom(roomId);
        RoomStatus currentStatus = room.getStatus();
        if (currentStatus == targetStatus) {
            return RoomResponse.from(room);
        }

        Set<RoomStatus> allowedStatuses = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowedStatuses.contains(targetStatus)) {
            throw new BusinessRuleException(
                    "Invalid room status transition from " + currentStatus + " to " + targetStatus
            );
        }

        room.setStatus(targetStatus);
        return RoomResponse.from(roomRepository.save(room));
    }

    private Room findRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
    }
}
