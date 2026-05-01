package com.hotel.backend.room.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RoomImageDto {

    public record ImageResponse(
            Integer       id,
            Integer       roomId,
            String        url,
            String        publicId,
            Boolean       isPrimary,
            String        caption,
            LocalDateTime uploadedAt
    ) {}

    public record UpdateCaptionRequest(String caption) {}

    // Danh sách ảnh của 1 phòng
    public record RoomImagesResponse(
            Integer             roomId,
            int                 total,
            List<ImageResponse> images
    ) {}

    public record RoomWithImages(
            List<ImageResponse> images,
            String              primaryImageUrl
    ) {}
}
