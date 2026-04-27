package com.hotel.backend.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Data;


@Data
public class AdminBookingDto {
    private Integer id;
    private Integer userId;
    private Integer hotelId;
    private Integer roomId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalPrice;
    private String status;
    private Instant createdAt;
    private String guestName;
    private String guestPhone;
}
