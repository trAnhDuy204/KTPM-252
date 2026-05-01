package com.hotel.backend.room.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_images")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "room_id", nullable = false)
    private Integer roomId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;           // Cloudinary secure_url

    @Column(name = "public_id", nullable = false, unique = true, length = 255)
    private String publicId;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(length = 255)
    private String caption;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}
