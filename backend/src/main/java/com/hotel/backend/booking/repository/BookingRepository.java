package com.hotel.backend.booking.repository;

import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByHotel_Id(Integer hotelId);

    List<Booking> findByStatus(BookingStatus status);

    Optional<Booking> findById(Integer bookingId);

    List<Booking> findByHotel_IdAndStatus(Integer hotelId, BookingStatus status);

    Optional<Booking> findByRoom_IdAndStatus(Integer roomId, BookingStatus status);

    boolean existsByRoom_IdAndStatus(Integer roomId, BookingStatus status);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Booking> findByUserIdAndStatus(Integer userId, BookingStatus status);
    
    boolean existsByIdAndUserId(Integer bookingId, Integer userId);

    List<Booking> findByUserId(Integer userId);

    @Query("""
SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
FROM Booking b
WHERE b.room.id = :roomId
AND b.id != :bookingId
AND b.status IN ('PENDING','CONFIRMED')
AND (
    b.checkIn < :checkOut AND b.checkOut > :checkIn
)
""")
boolean existsByRoom_IdAndDateOverlap(
    Integer roomId,
    LocalDate checkIn,
    LocalDate checkOut
);
}
