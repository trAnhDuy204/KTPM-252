package com.hotel.backend.services.controller;

import com.hotel.backend.services.dto.ServiceDto;
import com.hotel.backend.services.service.HotelServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicServiceController {

    private final HotelServiceService serviceService;

    public PublicServiceController(HotelServiceService serviceService) {
        this.serviceService = serviceService;
    }

    // GET /api/public/services?hotelId={id}
    @GetMapping("/services")
    public List<ServiceDto.ServiceResponse> getServicesByHotel(
            @RequestParam Integer hotelId) {
        return serviceService.getServicesByHotel(hotelId);
    }

    // GET /api/public/services/{id}
    @GetMapping("/services/{id}")
    public ServiceDto.ServiceResponse getServiceById(@PathVariable Integer id) {
        return serviceService.getAllServices()
                .stream()
                .filter(s -> s.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy dịch vụ #" + id));
    }

    // POST /api/public/bookings/{bookingId}/services
     @PostMapping("/bookings/{bookingId}/services")
    public ResponseEntity<ServiceDto.BookingServiceSummary> addServices(
            @PathVariable Integer bookingId,
            @Valid @RequestBody ServiceDto.AddServicesRequest request) {

        ServiceDto.BookingServiceSummary result =
                serviceService.addServicesToBooking(bookingId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // GET /api/public/bookings/{bookingId}/services
    @GetMapping("/bookings/{bookingId}/services")
    public ServiceDto.BookingServiceSummary getBookingServices(
            @PathVariable Integer bookingId) {
        return serviceService.getBookingServices(bookingId);
    }

    // PATCH /api/public/service-usages/{usageId}
    @PatchMapping("/service-usages/{usageId}")
    public ServiceDto.ServiceUsageResponse updateQuantity(
            @PathVariable Integer usageId,
            @RequestBody UpdateQuantityRequest body) {
        return serviceService.updateUsageQuantity(usageId, body.quantity());
    }

    // DELETE /api/public/service-usages/{usageId}
    @DeleteMapping("/service-usages/{usageId}")
    public ResponseEntity<Void> removeUsage(@PathVariable Integer usageId) {
        serviceService.removeServiceFromBooking(usageId);
        return ResponseEntity.noContent().build();
    }

    // inner record cho PATCH body
    record UpdateQuantityRequest(Integer quantity) {}
}
