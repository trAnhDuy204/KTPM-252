package com.hotel.backend.room.controller;

import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.room.entity.Room;
import com.hotel.backend.room.entity.RoomImage;
import com.hotel.backend.room.entity.RoomStatus;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomImageRepository;
import com.hotel.backend.room.repository.RoomRepository;
import com.hotel.backend.room.repository.RoomTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomForCustomerAccessControllerTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private RoomImageRepository roomImageRepository;

    @InjectMocks
    private RoomForCustomerAccessController controller;

    @Test
    void getRoomTypes_shouldReturnRoomTypeOptionsByHotelId() {
        RoomType roomType = mock(RoomType.class);

        when(roomType.getId()).thenReturn(1);
        when(roomType.getName()).thenReturn("Deluxe");
        when(roomType.getCapacity()).thenReturn(2);
        when(roomType.getBasePrice()).thenReturn(BigDecimal.valueOf(500000));
        when(roomTypeRepository.findByHotel_Id(10)).thenReturn(List.of(roomType));

        List<RoomForCustomerAccessController.RoomTypeOption> result =
                controller.getRoomTypes(10);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1);
        assertThat(result.get(0).name()).isEqualTo("Deluxe");
        assertThat(result.get(0).capacity()).isEqualTo(2);
        assertThat(result.get(0).basePrice()).isEqualTo("500000");

        verify(roomTypeRepository).findByHotel_Id(10);
    }

    @Test
    void getRooms_shouldFindRoomsByHotelIdWhenHotelIdExists() {
        Room room = mock(Room.class);
        RoomType roomType = mock(RoomType.class);
        Hotel hotel = mock(Hotel.class);

        mockRoomForRoomResponse(room, roomType, hotel);
        when(roomRepository.findByHotel_Id(10)).thenReturn(List.of(room));

        var result = controller.getRooms(10);

        assertThat(result).hasSize(1);
        verify(roomRepository).findByHotel_Id(10);
        verify(roomRepository, never()).findAll();
    }

    @Test
    void getRooms_shouldFindAllRoomsWhenHotelIdIsNull() {
        Room room = mock(Room.class);
        RoomType roomType = mock(RoomType.class);
        Hotel hotel = mock(Hotel.class);

        mockRoomForRoomResponse(room, roomType, hotel);
        when(roomRepository.findAll()).thenReturn(List.of(room));

        var result = controller.getRooms(null);

        assertThat(result).hasSize(1);
        verify(roomRepository).findAll();
        verify(roomRepository, never()).findByHotel_Id(any());
    }

    @Test
    void getRoomById_shouldReturnRoomDetailWithPrimaryImage() {
        Room room = mock(Room.class);
        RoomType roomType = mock(RoomType.class);
        Hotel hotel = mock(Hotel.class);
        RoomImage primaryImage = mock(RoomImage.class);
        RoomImage normalImage = mock(RoomImage.class);

        when(roomRepository.findById(1)).thenReturn(Optional.of(room));

        when(room.getId()).thenReturn(1);
        when(room.getRoomNumber()).thenReturn("101");
        when(room.getStatus()).thenReturn(RoomStatus.AVAILABLE);
        when(room.getRoomType()).thenReturn(roomType);
        when(room.getHotel()).thenReturn(hotel);

        when(hotel.getId()).thenReturn(10);
        when(hotel.getName()).thenReturn("Sun Hotel");
        when(hotel.getCity()).thenReturn("Da Nang");
        when(hotel.getAddress()).thenReturn("123 Beach Street");

        when(roomType.getId()).thenReturn(20);
        when(roomType.getName()).thenReturn("Deluxe");
        when(roomType.getCapacity()).thenReturn(2);
        when(roomType.getBasePrice()).thenReturn(BigDecimal.valueOf(700000));
        when(roomType.getDescription()).thenReturn("Nice room");

        when(primaryImage.getId()).thenReturn(100);
        when(primaryImage.getUrl()).thenReturn("primary.jpg");
        when(primaryImage.getIsPrimary()).thenReturn(true);
        when(primaryImage.getCaption()).thenReturn("Primary image");

        when(normalImage.getId()).thenReturn(101);
        when(normalImage.getUrl()).thenReturn("normal.jpg");
        when(normalImage.getIsPrimary()).thenReturn(false);
        when(normalImage.getCaption()).thenReturn("Normal image");

        when(roomImageRepository.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(1))
                .thenReturn(List.of(primaryImage, normalImage));

        RoomForCustomerAccessController.RoomDetailResponse result =
                controller.getRoomById(1);

        assertThat(result.id()).isEqualTo(1);
        assertThat(result.roomNumber()).isEqualTo("101");
        assertThat(result.status()).isEqualTo("AVAILABLE");

        assertThat(result.hotelId()).isEqualTo(10);
        assertThat(result.hotelName()).isEqualTo("Sun Hotel");
        assertThat(result.hotelCity()).isEqualTo("Da Nang");
        assertThat(result.hotelAddress()).isEqualTo("123 Beach Street");

        assertThat(result.roomTypeId()).isEqualTo(20);
        assertThat(result.roomTypeName()).isEqualTo("Deluxe");
        assertThat(result.capacity()).isEqualTo(2);
        assertThat(result.basePrice()).isEqualTo("700000");
        assertThat(result.description()).isEqualTo("Nice room");

        assertThat(result.images()).hasSize(2);
        assertThat(result.primaryImageUrl()).isEqualTo("primary.jpg");

        verify(roomRepository).findById(1);
        verify(roomImageRepository).findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(1);
    }

    @Test
    void getRoomById_shouldUseFirstImageAsPrimaryImageWhenNoPrimaryImageExists() {
        Room room = mock(Room.class);
        RoomImage image = mock(RoomImage.class);

        when(roomRepository.findById(1)).thenReturn(Optional.of(room));
        when(room.getId()).thenReturn(1);
        when(room.getRoomNumber()).thenReturn("101");
        when(room.getStatus()).thenReturn(null);
        when(room.getRoomType()).thenReturn(null);
        when(room.getHotel()).thenReturn(null);

        when(image.getId()).thenReturn(100);
        when(image.getUrl()).thenReturn("first.jpg");
        when(image.getIsPrimary()).thenReturn(false);
        when(image.getCaption()).thenReturn("First image");

        when(roomImageRepository.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(1))
                .thenReturn(List.of(image));

        RoomForCustomerAccessController.RoomDetailResponse result =
                controller.getRoomById(1);

        assertThat(result.primaryImageUrl()).isEqualTo("first.jpg");
        assertThat(result.status()).isNull();
        assertThat(result.hotelId()).isNull();
        assertThat(result.roomTypeId()).isNull();
    }

    @Test
    void getRoomById_shouldReturnNullPrimaryImageWhenRoomHasNoImages() {
        Room room = mock(Room.class);

        when(roomRepository.findById(1)).thenReturn(Optional.of(room));
        when(room.getId()).thenReturn(1);
        when(room.getRoomNumber()).thenReturn("101");
        when(room.getStatus()).thenReturn(null);
        when(room.getRoomType()).thenReturn(null);
        when(room.getHotel()).thenReturn(null);
        when(roomImageRepository.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(1))
                .thenReturn(List.of());

        RoomForCustomerAccessController.RoomDetailResponse result =
                controller.getRoomById(1);

        assertThat(result.images()).isEmpty();
        assertThat(result.primaryImageUrl()).isNull();
    }

    @Test
    void getRoomById_shouldThrowNotFoundWhenRoomDoesNotExist() {
        when(roomRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.getRoomById(99))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException exception = (ResponseStatusException) ex;
                    assertThat(exception.getStatusCode().value()).isEqualTo(404);
                    assertThat(exception.getReason()).isEqualTo("Phòng không tồn tại");
                });

        verify(roomRepository).findById(99);
        verifyNoInteractions(roomImageRepository);
    }

    private void mockRoomForRoomResponse(Room room, RoomType roomType, Hotel hotel) {
        when(room.getId()).thenReturn(1);
        when(room.getRoomNumber()).thenReturn("101");
        when(room.getStatus()).thenReturn(RoomStatus.AVAILABLE);
        when(room.getRoomType()).thenReturn(roomType);
        when(room.getHotel()).thenReturn(hotel);

        when(roomType.getId()).thenReturn(20);
        when(roomType.getName()).thenReturn("Deluxe");
        when(roomType.getCapacity()).thenReturn(2);
        when(roomType.getBasePrice()).thenReturn(BigDecimal.valueOf(500000));

        when(hotel.getId()).thenReturn(10);
        when(hotel.getName()).thenReturn("Sun Hotel");
    }
}
