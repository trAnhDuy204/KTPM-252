package com.hotel.backend.admin.service;

import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.admin.dto.AdminBookingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminBookingService {

    private final BookingRepository bookingRepository;

    public List<AdminBookingDto> getAllBookings() {
        return bookingRepository.findAll().stream().map(b -> {
            AdminBookingDto dto = new AdminBookingDto();
            dto.setId(b.getId());
            dto.setUserId(b.getUserId());
            dto.setHotelId(b.getHotel().getId());
            dto.setRoomId(b.getRoom().getId());
            dto.setCheckIn(b.getCheckIn());
            dto.setCheckOut(b.getCheckOut());
            dto.setTotalPrice(b.getTotalPrice());
            dto.setStatus(b.getStatus().name());
            dto.setCreatedAt(b.getCreatedAt());
            dto.setGuestName(b.getGuestName());
            dto.setGuestPhone(b.getGuestPhone());
            return dto;
        }).toList();
    }
}