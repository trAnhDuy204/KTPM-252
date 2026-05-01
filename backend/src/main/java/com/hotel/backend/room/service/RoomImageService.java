package com.hotel.backend.room.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hotel.backend.room.dto.RoomImageDto;
import com.hotel.backend.room.entity.RoomImage;
import com.hotel.backend.room.repository.RoomImageRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RoomImageService {

    private final RoomImageRepository imageRepo;
    private final Cloudinary cloudinary;

    @Value("${app.image.max-count-per-room:10}")
    private int maxImagesPerRoom;

    public RoomImageService(RoomImageRepository imageRepo, Cloudinary cloudinary) {
        this.imageRepo  = imageRepo;
        this.cloudinary = cloudinary;
    }

    //Lấy tất cả ảnh của phòng
    public RoomImageDto.RoomImagesResponse getRoomImages(Integer roomId) {
        List<RoomImage> images =
                imageRepo.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(roomId);

        return new RoomImageDto.RoomImagesResponse(
                roomId,
                images.size(),
                images.stream().map(this::toResponse).toList()
        );
    }

    // Upload một hoặc nhiều ảnh
    @Transactional
    public List<RoomImageDto.ImageResponse> uploadImages(
            Integer roomId,
            MultipartFile[] files,
            String caption) throws IOException {

        // Kiểm tra giới hạn số ảnh
        int current = imageRepo.countByRoomId(roomId);
        if (current + files.length > maxImagesPerRoom) {
            throw new IllegalStateException(
                    "Phòng này đã có " + current + " ảnh. " +
                    "Tối đa " + maxImagesPerRoom + " ảnh mỗi phòng.");
        }

        List<RoomImageDto.ImageResponse> results = new ArrayList<>();

        for (MultipartFile file : files) {
            // Upload lên Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder",          "hotel-rooms/" + roomId,
                            "resource_type",   "image",
                            "transformation",  "q_auto,f_auto,w_1200,c_limit"
                    )
            );

            String url      = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            // Ảnh đầu tiên của phòng tự động là primary
            boolean isPrimary = (current == 0 && results.isEmpty());

            RoomImage entity = RoomImage.builder()
                    .roomId(roomId)
                    .url(url)
                    .publicId(publicId)
                    .isPrimary(isPrimary)
                    .caption(caption)
                    .build();

            results.add(toResponse(imageRepo.save(entity)));
        }

        return results;
    }

    // Đặt ảnh làm primary
    @Transactional
    public RoomImageDto.ImageResponse setPrimary(Integer roomId, Integer imageId) {
        RoomImage image = imageRepo.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy ảnh #" + imageId));

        if (!image.getRoomId().equals(roomId)) {
            throw new IllegalArgumentException("Ảnh không thuộc phòng này");
        }

        // Bỏ primary của tất cả ảnh khác trong phòng
        imageRepo.clearPrimaryByRoomId(roomId);

        // Set primary cho ảnh được chọn
        image.setIsPrimary(true);
        return toResponse(imageRepo.save(image));
    }

    // Cập nhật caption
    @Transactional
    public RoomImageDto.ImageResponse updateCaption(Integer imageId, String caption) {
        RoomImage image = imageRepo.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy ảnh #" + imageId));
        image.setCaption(caption);
        return toResponse(imageRepo.save(image));
    }

    // Xóa ảnh
    @Transactional
    public void deleteImage(Integer roomId, Integer imageId) throws IOException {
        RoomImage image = imageRepo.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy ảnh #" + imageId));

        if (!image.getRoomId().equals(roomId)) {
            throw new IllegalArgumentException("Ảnh không thuộc phòng này");
        }

        // Xóa khỏi Cloudinary trước
        cloudinary.uploader().destroy(
                image.getPublicId(),
                ObjectUtils.asMap("resource_type", "image")
        );

        imageRepo.delete(image);

        // Nếu ảnh bị xóa là primary, set ảnh đầu tiên còn lại làm primary
        if (Boolean.TRUE.equals(image.getIsPrimary())) {
            imageRepo.findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(roomId)
                     .stream().findFirst()
                     .ifPresent(first -> {
                         first.setIsPrimary(true);
                         imageRepo.save(first);
                     });
        }
    }

    // Helper
    private RoomImageDto.ImageResponse toResponse(RoomImage img) {
        return new RoomImageDto.ImageResponse(
                img.getId(), img.getRoomId(), img.getUrl(),
                img.getPublicId(), img.getIsPrimary(),
                img.getCaption(), img.getUploadedAt()
        );
    }
}
