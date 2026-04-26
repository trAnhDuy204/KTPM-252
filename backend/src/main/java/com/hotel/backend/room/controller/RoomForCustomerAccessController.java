package com.hotel.backend.room.controller;


import com.hotel.backend.room.dto.RoomResponse;
import com.hotel.backend.room.repository.RoomTypeRepository;
import com.hotel.backend.room.repository.RoomRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;



@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomForCustomerAccessController {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomForCustomerAccessController(
            RoomRepository roomRepository,
            RoomTypeRepository roomTypeRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    //ROOM TYPES
    @GetMapping("/room-types")
    public List<RoomTypeOption> getRoomTypes(@RequestParam Integer hotelId) {
        return roomTypeRepository.findByHotel_Id(hotelId).stream()
                .map(rt -> new RoomTypeOption(
                        rt.getId(),
                        rt.getName(),
                        rt.getCapacity(),
                        rt.getBasePrice().toPlainString()
                ))
                .toList();
    }

    //ROOMS
    @GetMapping("/rooms")
    public List<RoomResponse> getRooms(@RequestParam (required = false) Integer hotelId) 
    {
        if(hotelId!=null)
        {
                return roomRepository.findByHotel_Id(hotelId).stream()
                .map(RoomResponse::from)
                .toList();
        }
        return roomRepository.findAll()
            .stream()
            .map(RoomResponse::from)
            .toList();
    }

    // DTOs
    record RoomTypeOption(
            Integer id,
            String name,
            Integer capacity,
            String basePrice
    ) {}
}
    


