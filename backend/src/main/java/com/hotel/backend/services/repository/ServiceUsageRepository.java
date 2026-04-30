package com.hotel.backend.services.repository;

import com.hotel.backend.services.entity.ServiceUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ServiceUsageRepository extends JpaRepository<ServiceUsage, Integer> {

    // Tất cả dịch vụ đã dùng trong 1 booking
    List<ServiceUsage> findByBookingId(Integer bookingId);

    // Xóa toàn bộ dịch vụ của 1 booking (dùng khi cancel)
    void deleteByBookingId(Integer bookingId);

    // Tính tổng tiền dịch vụ của 1 booking
    @Query("SELECT COALESCE(SUM(su.totalPrice), 0) FROM ServiceUsage su WHERE su.bookingId = :bookingId")
    BigDecimal sumTotalPriceByBookingId(Integer bookingId);

    // Kiểm tra booking có dùng dịch vụ này chưa
    boolean existsByBookingIdAndServiceId(Integer bookingId, Integer serviceId);
}