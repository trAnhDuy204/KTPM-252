package com.hotel.backend.services.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "service_usages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ServiceUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "booking_id")
    private Integer bookingId;

    @Column(name = "service_id")
    private Integer serviceId;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;
}
