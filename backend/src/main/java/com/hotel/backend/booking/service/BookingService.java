package com.hotel.backend.booking.service;

import com.hotel.backend.booking.dto.BookingResponse;
import com.hotel.backend.booking.dto.CheckInRequest;
import com.hotel.backend.booking.dto.CreateBookingRequest;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.common.BusinessRuleException;
import com.hotel.backend.common.ResourceNotFoundException;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.repository.RoomRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public BookingResponse checkIn(CheckInRequest request) {
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với id: " + request.roomId()));

        if (room.getStatus() != RoomStatus.AVAILABLE && room.getStatus() != RoomStatus.RESERVED) {
            throw new BusinessRuleException("Phòng không khả dụng để check-in. Trạng thái hiện tại: " + room.getStatus());
        }

        if (bookingRepository.existsByRoom_IdAndStatus(request.roomId(), BookingStatus.CHECKED_IN)) {
            throw new BusinessRuleException("Phòng đã có khách đang ở");
        }

        LocalDate today = LocalDate.now();
        if (request.checkOut().isBefore(today) || request.checkOut().isEqual(today)) {
            throw new BusinessRuleException("Ngày check-out phải sau ngày hôm nay");
        }

        long nights = ChronoUnit.DAYS.between(today, request.checkOut());
        BigDecimal pricePerNight = room.getRoomType().getBasePrice();
        BigDecimal totalPrice = pricePerNight.multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setHotel(room.getHotel());
        booking.setRoom(room);
        booking.setCheckIn(today);
        booking.setCheckOut(request.checkOut());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setGuestName(request.guestName());
        booking.setGuestPhone(request.guestPhone());

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    @Transactional
    public BookingResponse checkOut(Integer bookingId) {
        Booking booking = findBooking(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new BusinessRuleException("Booking chưa check-in. Trạng thái hiện tại: " + booking.getStatus());
        }

        LocalDate actualCheckOut = LocalDate.now();
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCheckOut(actualCheckOut);

        // Recalculate price based on actual stay duration
        long actualNights = ChronoUnit.DAYS.between(booking.getCheckIn(), actualCheckOut);
        if (actualNights < 1) {
            actualNights = 1; // Minimum 1 night charge
        }
        BigDecimal pricePerNight = booking.getRoom().getRoomType().getBasePrice();
        booking.setTotalPrice(pricePerNight.multiply(BigDecimal.valueOf(actualNights)));

        Room room = booking.getRoom();
        room.setStatus(RoomStatus.CLEANING);
        roomRepository.save(room);

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(Integer bookingId) {
        Booking booking = findBooking(bookingId);

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleException("Không thể huỷ booking có trạng thái: " + booking.getStatus());
        }

        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);

        Room room = booking.getRoom();
        if (previousStatus == BookingStatus.CHECKED_IN) {
            room.setStatus(RoomStatus.CLEANING);
            roomRepository.save(room);
        } else if (previousStatus == BookingStatus.PENDING || previousStatus == BookingStatus.CONFIRMED) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    public List<BookingResponse> getBookings(Integer hotelId, BookingStatus status) {
        List<Booking> bookings;
        if (hotelId != null && status != null) {
            bookings = bookingRepository.findByHotel_IdAndStatus(hotelId, status);
        } else if (hotelId != null) {
            bookings = bookingRepository.findByHotel_Id(hotelId);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream().map(BookingResponse::from).toList();
    }

    public BookingResponse getBooking(Integer bookingId) {
        return BookingResponse.from(findBooking(bookingId));
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với id: " + request.roomId()));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BusinessRuleException("Phòng không khả dụng để đặt. Trạng thái hiện tại: " + room.getStatus());
        }

        LocalDate today = LocalDate.now();
        if (request.checkIn().isBefore(today)) {
            throw new BusinessRuleException("Ngày check-in không được trong quá khứ");
        }
        if (!request.checkOut().isAfter(request.checkIn())) {
            throw new BusinessRuleException("Ngày check-out phải sau ngày check-in");
        }

        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal pricePerNight = room.getRoomType().getBasePrice();
        BigDecimal totalPrice = pricePerNight.multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setHotel(room.getHotel());
        booking.setRoom(room);
        booking.setCheckIn(request.checkIn());
        booking.setCheckOut(request.checkOut());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);
        booking.setGuestName(request.guestName());
        booking.setGuestPhone(request.guestPhone());

        room.setStatus(RoomStatus.RESERVED);
        roomRepository.save(room);

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    @Transactional
    public BookingResponse confirmBooking(Integer bookingId) {
        Booking booking = findBooking(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessRuleException("Chỉ có thể xác nhận booking ở trạng thái PENDING. Trạng thái hiện tại: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    private Booking findBooking(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking với id: " + bookingId));
    }
}
