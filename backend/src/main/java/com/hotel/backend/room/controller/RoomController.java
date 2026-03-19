package com.hotel.backend.room.controller;

import com.hotel.backend.room.dto.CreateRoomRequest;
import com.hotel.backend.room.dto.RoomResponse;
import com.hotel.backend.room.dto.UpdateRoomStatusRequest;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.service.RoomService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reception/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest request) {
        return roomService.createRoom(request);
    }

    @GetMapping
    public List<RoomResponse> getRooms(
            @RequestParam(required = false) Integer hotelId,
            @RequestParam(required = false) RoomStatus status
    ) {
        return roomService.getRooms(hotelId, status);
    }

    @GetMapping("/{roomId}")
    public RoomResponse getRoom(@PathVariable Integer roomId) {
        return roomService.getRoom(roomId);
    }

    @PatchMapping("/{roomId}/status")
    public RoomResponse updateRoomStatus(
            @PathVariable Integer roomId,
            @Valid @RequestBody UpdateRoomStatusRequest request
    ) {
        return roomService.updateRoomStatus(roomId, request.status());
    }

    @DeleteMapping("/{roomId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(@PathVariable Integer roomId) {
        roomService.deleteRoom(roomId);
    }
}
