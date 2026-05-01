package com.hotel.backend.booking.dto;

import java.time.LocalDate;


public record UpdateBookingRequest(
    LocalDate checkIn,
    LocalDate checkOut
) {}

