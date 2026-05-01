package com.hotel.backend.room.repository;

import com.hotel.backend.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Integer> {

    // Tất cả ảnh của 1 phòng, ảnh primary trước
    List<RoomImage> findByRoomIdOrderByIsPrimaryDescUploadedAtAsc(Integer roomId);

    // Ảnh primary của phòng
    Optional<RoomImage> findByRoomIdAndIsPrimaryTrue(Integer roomId);

    // Đếm số ảnh của phòng
    int countByRoomId(Integer roomId);

    // Reset tất cả is_primary về false trước khi set primary mới
    @Modifying
    @Transactional
    @Query("UPDATE RoomImage ri SET ri.isPrimary = false WHERE ri.roomId = :roomId")
    void clearPrimaryByRoomId(Integer roomId);

    // Xóa tất cả ảnh của phòng (khi xóa phòng)
    void deleteByRoomId(Integer roomId);
}