package com.hotel.backend.room.controller;

import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.hotel.repository.HotelRepository;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomTypeRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reception")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomLookupController {

    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomLookupController(HotelRepository hotelRepository, RoomTypeRepository roomTypeRepository) {
        this.hotelRepository = hotelRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    @GetMapping("/hotels")
    public List<HotelOption> getHotels() {
        return hotelRepository.findAll().stream()
                .map(h -> new HotelOption(h.getId(), h.getName(), h.getCity()))
                .toList();
    }

    @GetMapping("/room-types")
    public List<RoomTypeOption> getRoomTypes(@RequestParam Integer hotelId) {
        return roomTypeRepository.findByHotel_Id(hotelId).stream()
                .map(rt -> new RoomTypeOption(rt.getId(), rt.getName(), rt.getCapacity(), rt.getBasePrice().toPlainString()))
                .toList();
    }

    record HotelOption(Integer id, String name, String city) {}
    record RoomTypeOption(Integer id, String name, Integer capacity, String basePrice) {}
}
