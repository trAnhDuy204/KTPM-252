package com.hotel.backend.room.controller;

import com.hotel.backend.room.dto.RoomImageDto;
import com.hotel.backend.room.service.RoomImageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomImageControllerTest {

    @Mock
    private RoomImageService imageService;

    @InjectMocks
    private RoomImageController roomImageController;

    @Test
    void getImages_shouldReturnRoomImagesFromService() {
        Integer roomId = 1;
        RoomImageDto.RoomImagesResponse expectedResponse =
                mock(RoomImageDto.RoomImagesResponse.class);

        when(imageService.getRoomImages(roomId)).thenReturn(expectedResponse);

        RoomImageDto.RoomImagesResponse result =
                roomImageController.getImages(roomId);

        assertThat(result).isSameAs(expectedResponse);
        verify(imageService).getRoomImages(roomId);
    }

    @Test
    void uploadImages_shouldReturnBadRequestWhenFilesIsNull() throws IOException {
        ResponseEntity<List<RoomImageDto.ImageResponse>> response =
                roomImageController.uploadImages(1, null, "caption");

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNull();
        verifyNoInteractions(imageService);
    }

    @Test
    void uploadImages_shouldReturnBadRequestWhenFilesIsEmpty() throws IOException {
        ResponseEntity<List<RoomImageDto.ImageResponse>> response =
                roomImageController.uploadImages(1, new MultipartFile[0], "caption");

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNull();
        verifyNoInteractions(imageService);
    }

    @Test
    void uploadImages_shouldUploadFilesAndReturnCreated() throws IOException {
        Integer roomId = 1;
        String caption = "Nice room";
        MultipartFile file = mock(MultipartFile.class);
        MultipartFile[] files = new MultipartFile[]{file};

        RoomImageDto.ImageResponse imageResponse =
                mock(RoomImageDto.ImageResponse.class);
        List<RoomImageDto.ImageResponse> expectedResponse = List.of(imageResponse);

        when(imageService.uploadImages(roomId, files, caption))
                .thenReturn(expectedResponse);

        ResponseEntity<List<RoomImageDto.ImageResponse>> response =
                roomImageController.uploadImages(roomId, files, caption);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(imageService).uploadImages(roomId, files, caption);
    }

    @Test
    void setPrimary_shouldReturnUpdatedImageFromService() {
        Integer roomId = 1;
        Integer imageId = 10;
        RoomImageDto.ImageResponse expectedResponse =
                mock(RoomImageDto.ImageResponse.class);

        when(imageService.setPrimary(roomId, imageId)).thenReturn(expectedResponse);

        RoomImageDto.ImageResponse result =
                roomImageController.setPrimary(roomId, imageId);

        assertThat(result).isSameAs(expectedResponse);
        verify(imageService).setPrimary(roomId, imageId);
    }

    @Test
    void updateCaption_shouldUpdateCaptionAndReturnImageFromService() {
        Integer roomId = 1;
        Integer imageId = 10;
        RoomImageDto.UpdateCaptionRequest request =
                mock(RoomImageDto.UpdateCaptionRequest.class);
        RoomImageDto.ImageResponse expectedResponse =
                mock(RoomImageDto.ImageResponse.class);

        when(request.caption()).thenReturn("New caption");
        when(imageService.updateCaption(imageId, "New caption"))
                .thenReturn(expectedResponse);

        RoomImageDto.ImageResponse result =
                roomImageController.updateCaption(roomId, imageId, request);

        assertThat(result).isSameAs(expectedResponse);
        verify(imageService).updateCaption(imageId, "New caption");
        verifyNoMoreInteractions(imageService);
    }

    @Test
    void deleteImage_shouldDeleteImageAndReturnNoContent() throws IOException {
        Integer roomId = 1;
        Integer imageId = 10;

        ResponseEntity<Void> response =
                roomImageController.deleteImage(roomId, imageId);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        verify(imageService).deleteImage(roomId, imageId);
    }
}
