package com.hotel.backend.room.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.hotel.backend.room.dto.RoomImageDto;
import com.hotel.backend.room.entity.RoomImage;
import com.hotel.backend.room.repository.RoomImageRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomImageServiceTest {

    @Mock
    private RoomImageRepository imageRepo;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private RoomImageService roomImageService;

    @Test
    void getRoomImages_shouldReturnImagesByRoomId() {
        RoomImage image = roomImage(1, 10, "url.jpg", "public-id", true, "caption");

        when(imageRepo.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(10))
                .thenReturn(List.of(image));

        RoomImageDto.RoomImagesResponse result = roomImageService.getRoomImages(10);

        assertThat(result.roomId()).isEqualTo(10);
        assertThat(result.images()).hasSize(1);
        assertThat(result.images().get(0).id()).isEqualTo(1);
        assertThat(result.images().get(0).url()).isEqualTo("url.jpg");

        verify(imageRepo).findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(10);
    }

    @Test
    void uploadImages_shouldUploadAndSaveImageAsPrimaryWhenRoomHasNoImages() throws IOException {
        ReflectionTestUtils.setField(roomImageService, "maxImagesPerRoom", 10);

        MultipartFile file = new MockMultipartFile(
                "files",
                "room.jpg",
                "image/jpeg",
                "image-content".getBytes()
        );

        when(imageRepo.countByRoomId(10)).thenReturn(0);
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), anyMap()))
                .thenReturn(Map.of(
                        "secure_url", "https://cloudinary.com/room.jpg",
                        "public_id", "hotel-rooms/10/room"
                ));
        when(imageRepo.save(any(RoomImage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<RoomImageDto.ImageResponse> result =
                roomImageService.uploadImages(10, new MultipartFile[]{file}, "Nice room");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).roomId()).isEqualTo(10);
        assertThat(result.get(0).url()).isEqualTo("https://cloudinary.com/room.jpg");
        assertThat(result.get(0).publicId()).isEqualTo("hotel-rooms/10/room");
        assertThat(result.get(0).isPrimary()).isTrue();
        assertThat(result.get(0).caption()).isEqualTo("Nice room");

        verify(imageRepo).countByRoomId(10);
        verify(imageRepo).save(any(RoomImage.class));
    }

    @Test
    void uploadImages_shouldThrowWhenImageLimitExceeded() {
        ReflectionTestUtils.setField(roomImageService, "maxImagesPerRoom", 2);

        MultipartFile file = new MockMultipartFile(
                "files",
                "room.jpg",
                "image/jpeg",
                "image-content".getBytes()
        );

        when(imageRepo.countByRoomId(10)).thenReturn(2);

        assertThatThrownBy(() ->
                roomImageService.uploadImages(10, new MultipartFile[]{file}, "caption"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Phòng này đã có 2 ảnh. Tối đa 2 ảnh mỗi phòng.");

        verify(imageRepo, never()).save(any());
        verifyNoInteractions(cloudinary);
    }

    @Test
    void setPrimary_shouldClearOldPrimaryAndSetSelectedImagePrimary() {
        RoomImage image = roomImage(1, 10, "url.jpg", "public-id", false, "caption");

        when(imageRepo.findById(1)).thenReturn(Optional.of(image));
        when(imageRepo.save(image)).thenReturn(image);

        RoomImageDto.ImageResponse result = roomImageService.setPrimary(10, 1);

        assertThat(result.isPrimary()).isTrue();
        verify(imageRepo).clearPrimaryByRoomId(10);
        verify(imageRepo).save(image);
    }

    @Test
    void setPrimary_shouldThrowWhenImageNotFound() {
        when(imageRepo.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomImageService.setPrimary(10, 99))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("Không tìm thấy ảnh #99");

        verify(imageRepo, never()).clearPrimaryByRoomId(any());
        verify(imageRepo, never()).save(any());
    }

    @Test
    void setPrimary_shouldThrowWhenImageDoesNotBelongToRoom() {
        RoomImage image = roomImage(1, 99, "url.jpg", "public-id", false, "caption");

        when(imageRepo.findById(1)).thenReturn(Optional.of(image));

        assertThatThrownBy(() -> roomImageService.setPrimary(10, 1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Ảnh không thuộc phòng này");

        verify(imageRepo, never()).clearPrimaryByRoomId(any());
        verify(imageRepo, never()).save(any());
    }

    @Test
    void updateCaption_shouldUpdateCaptionAndSaveImage() {
        RoomImage image = roomImage(1, 10, "url.jpg", "public-id", false, "old caption");

        when(imageRepo.findById(1)).thenReturn(Optional.of(image));
        when(imageRepo.save(image)).thenReturn(image);

        RoomImageDto.ImageResponse result = roomImageService.updateCaption(1, "new caption");

        assertThat(result.caption()).isEqualTo("new caption");
        verify(imageRepo).save(image);
    }

    @Test
    void deleteImage_shouldDeleteImageFromCloudinaryAndRepository() throws IOException {
        RoomImage image = roomImage(1, 10, "url.jpg", "public-id", false, "caption");

        when(imageRepo.findById(1)).thenReturn(Optional.of(image));
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.destroy(eq("public-id"), anyMap())).thenReturn(Map.of("result", "ok"));

        roomImageService.deleteImage(10, 1);

        verify(uploader).destroy(eq("public-id"), anyMap());
        verify(imageRepo).delete(image);
        verify(imageRepo, never()).findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(any());
    }

    @Test
    void deleteImage_shouldPromoteFirstRemainingImageWhenDeletedImageWasPrimary() throws IOException {
        RoomImage deletedImage = roomImage(1, 10, "old.jpg", "old-public-id", true, "old");
        RoomImage nextImage = roomImage(2, 10, "next.jpg", "next-public-id", false, "next");

        when(imageRepo.findById(1)).thenReturn(Optional.of(deletedImage));
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.destroy(eq("old-public-id"), anyMap())).thenReturn(Map.of("result", "ok"));
        when(imageRepo.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(10))
                .thenReturn(List.of(nextImage));

        roomImageService.deleteImage(10, 1);

        assertThat(nextImage.getIsPrimary()).isTrue();
        verify(imageRepo).delete(deletedImage);
        verify(imageRepo).save(nextImage);
    }

    @Test
    void deleteImage_shouldThrowWhenImageDoesNotBelongToRoom() {
        RoomImage image = roomImage(1, 99, "url.jpg", "public-id", false, "caption");

        when(imageRepo.findById(1)).thenReturn(Optional.of(image));

        assertThatThrownBy(() -> roomImageService.deleteImage(10, 1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Ảnh không thuộc phòng này");

        verify(imageRepo, never()).delete(any());
        verifyNoInteractions(cloudinary);
    }

    private RoomImage roomImage(
            Integer id,
            Integer roomId,
            String url,
            String publicId,
            Boolean isPrimary,
            String caption
    ) {
        return RoomImage.builder()
                .id(id)
                .roomId(roomId)
                .url(url)
                .publicId(publicId)
                .isPrimary(isPrimary)
                .caption(caption)
                .build();
    }
}
