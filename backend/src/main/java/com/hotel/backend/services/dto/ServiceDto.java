package com.hotel.backend.services.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class ServiceDto {

    public record ServiceResponse(
            Integer id,
            Integer hotelId,
            String  name,
            BigDecimal price
    ) {}

    public record SaveServiceRequest(
            @NotNull(message = "Hotel ID là bắt buộc")
            Integer hotelId,

            @NotBlank(message = "Tên dịch vụ là bắt buộc")
            @Size(max = 100, message = "Tên dịch vụ tối đa 100 ký tự")
            String name,

            @NotNull(message = "Giá là bắt buộc")
            @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
            BigDecimal price
    ) {}

    public record ServiceUsageResponse(
            Integer    id,
            Integer    bookingId,
            Integer    serviceId,
            String     serviceName,
            BigDecimal servicePrice,
            Integer    quantity,
            BigDecimal totalPrice
    ) {}

    // 1 item khi thêm dịch vụ vào booking
    public record ServiceUsageItem(
            @NotNull(message = "Service ID là bắt buộc")
            Integer serviceId,

            @NotNull(message = "Số lượng là bắt buộc")
            @Min(value = 1, message = "Số lượng tối thiểu là 1")
            Integer quantity
    ) {}

    // thêm nhiều dịch vụ vào 1 booking
    public record AddServicesRequest(
            @NotNull @Size(min = 1, message = "Phải có ít nhất 1 dịch vụ")
            List<ServiceUsageItem> services
    ) {}

    // Summary tổng dịch vụ của 1 booking
    public record BookingServiceSummary(
            Integer    bookingId,
            List<ServiceUsageResponse> usages,
            BigDecimal totalServiceCost
    ) {}
}
