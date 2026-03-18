package com.hotel.backend.booking.repository;

import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByHotel_Id(Integer hotelId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByHotel_IdAndStatus(Integer hotelId, BookingStatus status);

    Optional<Booking> findByRoom_IdAndStatus(Integer roomId, BookingStatus status);

    boolean existsByRoom_IdAndStatus(Integer roomId, BookingStatus status);
}
