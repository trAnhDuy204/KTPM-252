package com.hotel.backend.booking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hotel.backend.booking.dto.BookingResponse;
import com.hotel.backend.booking.dto.CheckInRequest;
import com.hotel.backend.booking.dto.CreateBookingRequest;
import com.hotel.backend.booking.entity.Booking;
import com.hotel.backend.booking.entity.BookingStatus;
import com.hotel.backend.booking.repository.BookingRepository;
import com.hotel.backend.common.BusinessRuleException;
import com.hotel.backend.common.ResourceNotFoundException;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    private BookingService bookingService;

    private Hotel hotel;
    private RoomType roomType;
    private Room room;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, roomRepository);

        hotel = new Hotel();
        hotel.setId(1);
        hotel.setName("Test Hotel");

        roomType = new RoomType();
        roomType.setId(1);
        roomType.setBasePrice(new BigDecimal("500000"));

        room = new Room();
        room.setId(10);
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber("101");
        room.setStatus(RoomStatus.AVAILABLE);
    }

    // ==================== CHECK-IN ====================

    @Nested
    class CheckIn {

        private CheckInRequest validRequest() {
            return new CheckInRequest(10, LocalDate.now().plusDays(2), "Nguyen Van A", "0901234567");
        }

        @Test
        void shouldCheckInSuccessfully() {
            CheckInRequest request = validRequest();
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(bookingRepository.existsByRoom_IdAndStatus(10, BookingStatus.CHECKED_IN)).thenReturn(false);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(1);
                return b;
            });
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            BookingResponse response = bookingService.checkIn(request);

            assertThat(response.status()).isEqualTo(BookingStatus.CHECKED_IN);
            assertThat(response.guestName()).isEqualTo("Nguyen Van A");
            assertThat(response.roomNumber()).isEqualTo("101");
            assertThat(response.checkIn()).isEqualTo(LocalDate.now());
        }

        @Test
        void shouldSetRoomToOccupiedOnCheckIn() {
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(bookingRepository.existsByRoom_IdAndStatus(10, BookingStatus.CHECKED_IN)).thenReturn(false);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(1);
                return b;
            });
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            bookingService.checkIn(validRequest());

            ArgumentCaptor<Room> roomCaptor = ArgumentCaptor.forClass(Room.class);
            verify(roomRepository).save(roomCaptor.capture());
            assertThat(roomCaptor.getValue().getStatus()).isEqualTo(RoomStatus.OCCUPIED);
        }

        @Test
        void shouldCalculateTotalPrice() {
            CheckInRequest request = new CheckInRequest(10, LocalDate.now().plusDays(3), "Guest", null);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(bookingRepository.existsByRoom_IdAndStatus(10, BookingStatus.CHECKED_IN)).thenReturn(false);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(1);
                return b;
            });
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            BookingResponse response = bookingService.checkIn(request);

            // 3 nights * 500,000 = 1,500,000
            assertThat(response.totalPrice()).isEqualByComparingTo(new BigDecimal("1500000"));
        }

        @Test
        void shouldAllowCheckInForReservedRoom() {
            room.setStatus(RoomStatus.RESERVED);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(bookingRepository.existsByRoom_IdAndStatus(10, BookingStatus.CHECKED_IN)).thenReturn(false);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(1);
                return b;
            });
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            BookingResponse response = bookingService.checkIn(validRequest());

            assertThat(response.status()).isEqualTo(BookingStatus.CHECKED_IN);
        }

        @ParameterizedTest(name = "Should reject check-in when room is {0}")
        @EnumSource(value = RoomStatus.class, names = {"OCCUPIED", "CLEANING", "MAINTENANCE"})
        void shouldRejectCheckInForUnavailableRoom(RoomStatus status) {
            room.setStatus(status);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> bookingService.checkIn(validRequest()))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not available for check-in");

            verify(bookingRepository, never()).save(any());
        }

        @Test
        void shouldRejectCheckInWhenRoomAlreadyCheckedIn() {
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(bookingRepository.existsByRoom_IdAndStatus(10, BookingStatus.CHECKED_IN)).thenReturn(true);

            assertThatThrownBy(() -> bookingService.checkIn(validRequest()))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("already has an active check-in");
        }

        @Test
        void shouldRejectCheckInWhenCheckOutDateIsToday() {
            CheckInRequest request = new CheckInRequest(10, LocalDate.now(), "Guest", null);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> bookingService.checkIn(request))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Check-out date must be after today");
        }

        @Test
        void shouldRejectCheckInWhenCheckOutDateIsPast() {
            CheckInRequest request = new CheckInRequest(10, LocalDate.now().minusDays(1), "Guest", null);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> bookingService.checkIn(request))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Check-out date must be after today");
        }

        @Test
        void shouldThrowWhenRoomNotFound() {
            CheckInRequest request = new CheckInRequest(99, LocalDate.now().plusDays(1), "Guest", null);
            when(roomRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.checkIn(request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Room not found");
        }
    }

    // ==================== CHECK-OUT ====================

    @Nested
    class CheckOut {

        @Test
        void shouldCheckOutSuccessfully() {
            Booking booking = buildBooking(1, BookingStatus.CHECKED_IN);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            BookingResponse response = bookingService.checkOut(1);

            assertThat(response.status()).isEqualTo(BookingStatus.COMPLETED);
            assertThat(response.checkOut()).isEqualTo(LocalDate.now());
        }

        @Test
        void shouldSetRoomToCleaningOnCheckOut() {
            Booking booking = buildBooking(1, BookingStatus.CHECKED_IN);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            bookingService.checkOut(1);

            ArgumentCaptor<Room> roomCaptor = ArgumentCaptor.forClass(Room.class);
            verify(roomRepository).save(roomCaptor.capture());
            assertThat(roomCaptor.getValue().getStatus()).isEqualTo(RoomStatus.CLEANING);
        }

        @ParameterizedTest(name = "Should reject check-out when booking is {0}")
        @EnumSource(value = BookingStatus.class, names = {"PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"})
        void shouldRejectCheckOutForNonCheckedInBooking(BookingStatus status) {
            Booking booking = buildBooking(1, status);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.checkOut(1))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not checked in");
        }

        @Test
        void shouldThrowWhenBookingNotFound() {
            when(bookingRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.checkOut(99))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Booking not found");
        }
    }

    // ==================== CANCEL BOOKING ====================

    @Nested
    class CancelBooking {

        @Test
        void shouldCancelCheckedInBookingAndSetRoomToCleaning() {
            Booking booking = buildBooking(1, BookingStatus.CHECKED_IN);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
            when(roomRepository.save(any(Room.class))).thenReturn(room);

            BookingResponse response = bookingService.cancelBooking(1);

            assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
            verify(roomRepository).save(room);
        }

        @Test
        void shouldCancelPendingBookingWithoutChangingRoom() {
            Booking booking = buildBooking(1, BookingStatus.PENDING);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            BookingResponse response = bookingService.cancelBooking(1);

            assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
            verify(roomRepository, never()).save(any());
        }

        @Test
        void shouldRejectCancelForCompletedBooking() {
            Booking booking = buildBooking(1, BookingStatus.COMPLETED);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.cancelBooking(1))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Cannot cancel");
        }

        @Test
        void shouldRejectCancelForAlreadyCancelledBooking() {
            Booking booking = buildBooking(1, BookingStatus.CANCELLED);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.cancelBooking(1))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Cannot cancel");
        }
    }

    // ==================== GET BOOKINGS ====================

    @Nested
    class GetBookings {

        @Test
        void shouldReturnAllBookings() {
            Booking b1 = buildBooking(1, BookingStatus.CHECKED_IN);
            Booking b2 = buildBooking(2, BookingStatus.COMPLETED);
            when(bookingRepository.findAll()).thenReturn(List.of(b1, b2));

            List<BookingResponse> result = bookingService.getBookings(null, null);

            assertThat(result).hasSize(2);
        }

        @Test
        void shouldFilterByHotelId() {
            Booking b = buildBooking(1, BookingStatus.CHECKED_IN);
            when(bookingRepository.findByHotel_Id(1)).thenReturn(List.of(b));

            List<BookingResponse> result = bookingService.getBookings(1, null);

            assertThat(result).hasSize(1);
        }

        @Test
        void shouldFilterByStatus() {
            Booking b = buildBooking(1, BookingStatus.CHECKED_IN);
            when(bookingRepository.findByStatus(BookingStatus.CHECKED_IN)).thenReturn(List.of(b));

            List<BookingResponse> result = bookingService.getBookings(null, BookingStatus.CHECKED_IN);

            assertThat(result).hasSize(1);
        }
    }

    // ==================== CREATE BOOKING ====================

    @Nested
    class CreateBooking {

        private CreateBookingRequest validRequest() {
            return new CreateBookingRequest(
                    10,
                    LocalDate.now().plusDays(1),
                    LocalDate.now().plusDays(3),
                    "Nguyen Van B",
                    "0909090909"
            );
        }

        @Test
        void shouldCreateBookingSuccessfully() {
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(any(Room.class))).thenReturn(room);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(5);
                return b;
            });

            BookingResponse response = bookingService.createBooking(validRequest());

            assertThat(response.status()).isEqualTo(BookingStatus.PENDING);
            assertThat(response.guestName()).isEqualTo("Nguyen Van B");
        }

        @Test
        void shouldSetRoomToReservedOnCreate() {
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(any(Room.class))).thenReturn(room);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(5);
                return b;
            });

            bookingService.createBooking(validRequest());

            ArgumentCaptor<Room> roomCaptor = ArgumentCaptor.forClass(Room.class);
            verify(roomRepository).save(roomCaptor.capture());
            assertThat(roomCaptor.getValue().getStatus()).isEqualTo(RoomStatus.RESERVED);
        }

        @Test
        void shouldCalculateTotalPriceForAdvanceBooking() {
            CreateBookingRequest request = new CreateBookingRequest(
                    10, LocalDate.now().plusDays(1), LocalDate.now().plusDays(4), "Guest", null);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));
            when(roomRepository.save(any(Room.class))).thenReturn(room);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
                Booking b = inv.getArgument(0);
                b.setId(5);
                return b;
            });

            BookingResponse response = bookingService.createBooking(request);

            // 3 nights * 500,000 = 1,500,000
            assertThat(response.totalPrice()).isEqualByComparingTo(new BigDecimal("1500000"));
        }

        @ParameterizedTest(name = "Should reject booking when room is {0}")
        @EnumSource(value = RoomStatus.class, names = {"OCCUPIED", "RESERVED", "CLEANING", "MAINTENANCE"})
        void shouldRejectBookingForUnavailableRoom(RoomStatus status) {
            room.setStatus(status);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> bookingService.createBooking(validRequest()))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not available for booking");

            verify(bookingRepository, never()).save(any());
        }

        @Test
        void shouldRejectBookingWhenCheckInIsInPast() {
            CreateBookingRequest request = new CreateBookingRequest(
                    10, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1), "Guest", null);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> bookingService.createBooking(request))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Check-in date cannot be in the past");
        }

        @Test
        void shouldRejectBookingWhenCheckOutNotAfterCheckIn() {
            CreateBookingRequest request = new CreateBookingRequest(
                    10, LocalDate.now().plusDays(2), LocalDate.now().plusDays(1), "Guest", null);
            when(roomRepository.findById(10)).thenReturn(Optional.of(room));

            assertThatThrownBy(() -> bookingService.createBooking(request))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Check-out date must be after check-in date");
        }

        @Test
        void shouldThrowWhenRoomNotFound() {
            CreateBookingRequest request = new CreateBookingRequest(
                    99, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), "Guest", null);
            when(roomRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.createBooking(request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Room not found");
        }
    }

    // ==================== CONFIRM BOOKING ====================

    @Nested
    class ConfirmBooking {

        @Test
        void shouldConfirmPendingBookingSuccessfully() {
            Booking booking = buildBooking(1, BookingStatus.PENDING);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            BookingResponse response = bookingService.confirmBooking(1);

            assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        }

        @Test
        void shouldNotChangeRoomStatusOnConfirm() {
            Booking booking = buildBooking(1, BookingStatus.PENDING);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            bookingService.confirmBooking(1);

            verify(roomRepository, never()).save(any());
        }

        @ParameterizedTest(name = "Should reject confirm when booking is {0}")
        @EnumSource(value = BookingStatus.class, names = {"CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"})
        void shouldRejectConfirmForNonPendingBooking(BookingStatus status) {
            Booking booking = buildBooking(1, status);
            when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.confirmBooking(1))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Only PENDING bookings can be confirmed");
        }

        @Test
        void shouldThrowWhenBookingNotFound() {
            when(bookingRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.confirmBooking(99))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Booking not found");
        }
    }

    // ==================== Helper ====================

    private Booking buildBooking(Integer id, BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setHotel(hotel);
        booking.setRoom(room);
        booking.setCheckIn(LocalDate.now());
        booking.setCheckOut(LocalDate.now().plusDays(2));
        booking.setTotalPrice(new BigDecimal("1000000"));
        booking.setStatus(status);
        booking.setGuestName("Test Guest");
        booking.setGuestPhone("0901234567");
        return booking;
    }
}
