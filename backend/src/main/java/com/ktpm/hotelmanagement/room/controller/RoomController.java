package com.ktpm.hotelmanagement.room.controller;

import com.ktpm.hotelmanagement.room.dto.CreateRoomRequest;
import com.ktpm.hotelmanagement.room.dto.RoomResponse;
import com.ktpm.hotelmanagement.room.dto.UpdateRoomStatusRequest;
import com.ktpm.hotelmanagement.room.entity.RoomStatus;
import com.ktpm.hotelmanagement.room.service.RoomService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reception/rooms")
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
            @RequestParam(required = false) Long hotelId,
            @RequestParam(required = false) RoomStatus status
    ) {
        return roomService.getRooms(hotelId, status);
    }

    @GetMapping("/{roomId}")
    public RoomResponse getRoom(@PathVariable Long roomId) {
        return roomService.getRoom(roomId);
    }

    @PatchMapping("/{roomId}/status")
    public RoomResponse updateRoomStatus(
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomStatusRequest request
    ) {
        return roomService.updateRoomStatus(roomId, request.status());
    }
}
