package com.hotel.backend.room.controller;

import com.hotel.backend.room.dto.RoomImageDto;
import com.hotel.backend.room.service.RoomImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reception/rooms/{roomId}/images")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomImageController {

    private final RoomImageService imageService;

    public RoomImageController(RoomImageService imageService) {
        this.imageService = imageService;
    }

    // GET /api/reception/rooms/{roomId}/images
    @GetMapping
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public RoomImageDto.RoomImagesResponse getImages(@PathVariable Integer roomId) {
        return imageService.getRoomImages(roomId);
    }
    
    // POST /api/reception/rooms/{roomId}/images
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public ResponseEntity<List<RoomImageDto.ImageResponse>> uploadImages(
            @PathVariable Integer roomId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "caption", required = false) String caption)
            throws IOException {

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().build();
        }

        List<RoomImageDto.ImageResponse> result =
                imageService.uploadImages(roomId, files, caption);

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // PATCH /api/reception/rooms/{roomId}/images/{imageId}/primary
    @PatchMapping("/{imageId}/primary")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public RoomImageDto.ImageResponse setPrimary(
            @PathVariable Integer roomId,
            @PathVariable Integer imageId) {
        return imageService.setPrimary(roomId, imageId);
    }

    // PATCH /api/reception/rooms/{roomId}/images/{imageId}/caption
    @PatchMapping("/{imageId}/caption")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public RoomImageDto.ImageResponse updateCaption(
            @PathVariable Integer roomId,
            @PathVariable Integer imageId,
            @RequestBody RoomImageDto.UpdateCaptionRequest body) {
        return imageService.updateCaption(imageId, body.caption());
    }

    // DELETE /api/reception/rooms/{roomId}/images/{imageId}
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('RECEPTION') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Integer roomId,
            @PathVariable Integer imageId) throws IOException {
        imageService.deleteImage(roomId, imageId);
        return ResponseEntity.noContent().build();
    }
}
