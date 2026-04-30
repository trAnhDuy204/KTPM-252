package com.hotel.backend.services.controller;

import com.hotel.backend.services.dto.ServiceDto;
import com.hotel.backend.services.service.HotelServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminServiceController {

    private final HotelServiceService serviceService;

    public AdminServiceController(HotelServiceService serviceService) {
        this.serviceService = serviceService;
    }

    // GET /api/admin/services
    @GetMapping
    public List<ServiceDto.ServiceResponse> getAll(
            @RequestParam(required = false) Integer hotelId) {
        if (hotelId != null) {
            return serviceService.getServicesByHotel(hotelId);
        }
        return serviceService.getAllServices();
    }

    // POST /api/admin/services
    @PostMapping
    public ResponseEntity<ServiceDto.ServiceResponse> create(
            @Valid @RequestBody ServiceDto.SaveServiceRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(serviceService.createService(request));
    }

    // PUT /api/admin/services/{id}
    @PutMapping("/{id}")
    public ServiceDto.ServiceResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody ServiceDto.SaveServiceRequest request) {
        return serviceService.updateService(id, request);
    }

    // DELETE /api/admin/services/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
