package com.hotel.backend.room.controller;


import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.room.dto.RoomResponse;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomTypeRepository;
import com.hotel.backend.room.repository.RoomImageRepository;
import com.hotel.backend.room.repository.RoomRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;



@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomForCustomerAccessController {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomImageRepository roomImageRepository;

    public RoomForCustomerAccessController(
            RoomRepository roomRepository,
            RoomTypeRepository roomTypeRepository,
            RoomImageRepository roomImageRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomImageRepository = roomImageRepository;
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

    // GET /api/public/rooms/{id}
    @GetMapping("/rooms/{id}")
    public RoomDetailResponse getRoomById(@PathVariable Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Phòng không tồn tại"));
 
        RoomType rt = room.getRoomType();
        Hotel hotel = room.getHotel();
 
        List<ImageInfo> images = roomImageRepository
                .findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(id)
                .stream()
                .map(img -> new ImageInfo(
                        img.getId(), img.getUrl(),
                        img.getIsPrimary(), img.getCaption()))
                .toList();
 
        String primaryUrl = images.stream()
                .filter(ImageInfo::isPrimary)
                .map(ImageInfo::url)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).url());
 
        return new RoomDetailResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getStatus() != null ? room.getStatus().name() : null,
                hotel  != null ? hotel.getId()    : null,
                hotel  != null ? hotel.getName()  : null,
                hotel  != null ? hotel.getCity()  : null,
                hotel  != null ? hotel.getAddress(): null,
                rt     != null ? rt.getId()       : null,
                rt     != null ? rt.getName()     : null,
                rt     != null ? rt.getCapacity() : null,
                rt     != null ? rt.getBasePrice().toPlainString() : null,
                rt     != null ? rt.getDescription() : null,
                images,
                primaryUrl
        );
    }

    // DTOs
    record RoomTypeOption(
            Integer id,
            String name,
            Integer capacity,
            String basePrice
    ) {}

    record ImageInfo(
            Integer id,
            String  url,
            boolean isPrimary,
            String  caption
    ) {}
 
    record RoomDetailResponse(
            Integer         id,
            String          roomNumber,
            String          status,
            Integer         hotelId,
            String          hotelName,
            String          hotelCity,
            String          hotelAddress,
            Integer         roomTypeId,
            String          roomTypeName,
            Integer         capacity,
            String          basePrice,
            String          description,
            List<ImageInfo> images,
            String          primaryImageUrl
    ) {}
}
    


