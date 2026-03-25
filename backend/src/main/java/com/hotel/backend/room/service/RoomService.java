package com.hotel.backend.room.service;

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
    private final EntityManager entityManager;

    public RoomService(RoomRepository roomRepository, EntityManager entityManager) {
        this.roomRepository = roomRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        String roomNumber = request.roomNumber().trim();
        if (roomRepository.existsByHotel_IdAndRoomNumber(request.hotelId(), roomNumber)) {
            throw new BusinessRuleException("Số phòng đã tồn tại trong khách sạn");
        }

        Hotel hotel = entityManager.getReference(Hotel.class, request.hotelId());
        RoomType roomType = entityManager.getReference(RoomType.class, request.roomTypeId());

        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber(roomNumber);
        room.setStatus(request.status() == null ? RoomStatus.AVAILABLE : request.status());

        Room savedRoom = roomRepository.save(room);
        return RoomResponse.from(savedRoom);
    }

    public List<RoomResponse> getRooms(Integer hotelId, RoomStatus status) {
        List<Room> rooms;
        if (hotelId != null && status != null) {
            rooms = roomRepository.findByHotel_IdAndStatus(hotelId, status);
        } else if (hotelId != null) {
            rooms = roomRepository.findByHotel_Id(hotelId);
        } else if (status != null) {
            rooms = roomRepository.findByStatus(status);
        } else {
            rooms = roomRepository.findAll();
        }

        return rooms.stream().map(RoomResponse::from).toList();
    }

    public RoomResponse getRoom(Integer roomId) {
        return RoomResponse.from(findRoom(roomId));
    }

    @Transactional
    public RoomResponse updateRoomStatus(Integer roomId, RoomStatus targetStatus) {
        Room room = findRoom(roomId);
        RoomStatus currentStatus = room.getStatus();
        if (currentStatus == targetStatus) {
            return RoomResponse.from(room);
        }

        Set<RoomStatus> allowedStatuses = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowedStatuses.contains(targetStatus)) {
            throw new BusinessRuleException(
                    "Không thể chuyển trạng thái phòng từ " + currentStatus + " sang " + targetStatus
            );
        }

        room.setStatus(targetStatus);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Integer roomId) {
        Room room = findRoom(roomId);
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new BusinessRuleException("Không thể xóa phòng đang có khách ở");
        }
        roomRepository.delete(room);
    }

    private Room findRoom(Integer roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với id: " + roomId));
    }
}
