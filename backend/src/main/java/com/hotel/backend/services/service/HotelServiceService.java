package com.hotel.backend.services.service;

import com.hotel.backend.services.dto.ServiceDto;
import com.hotel.backend.services.entity.HotelService;
import com.hotel.backend.services.entity.ServiceUsage;
import com.hotel.backend.services.repository.HotelServiceRepository;
import com.hotel.backend.services.repository.ServiceUsageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class HotelServiceService {

    private final HotelServiceRepository serviceRepo;
    private final ServiceUsageRepository usageRepo;

    public HotelServiceService(HotelServiceRepository serviceRepo,
                               ServiceUsageRepository usageRepo) {
        this.serviceRepo = serviceRepo;
        this.usageRepo   = usageRepo;
    }

    // Lấy tất cả dịch vụ của một khách sạn
    public List<ServiceDto.ServiceResponse> getServicesByHotel(Integer hotelId) {
        return serviceRepo.findByHotelId(hotelId)
                .stream()
                .map(this::toServiceResponse)
                .toList();
    }

    //Lấy tất cả dịch vụ (admin)
    public List<ServiceDto.ServiceResponse> getAllServices() {
        return serviceRepo.findAll()
                .stream()
                .map(this::toServiceResponse)
                .toList();
    }

    //Tạo dịch vụ mới
    @Transactional
    public ServiceDto.ServiceResponse createService(ServiceDto.SaveServiceRequest req) {
        HotelService entity = HotelService.builder()
                .hotelId(req.hotelId())
                .name(req.name().trim())
                .price(req.price())
                .build();
        return toServiceResponse(serviceRepo.save(entity));
    }

    //Cập nhật dịch vụ
    @Transactional
    public ServiceDto.ServiceResponse updateService(Integer id,
                                                    ServiceDto.SaveServiceRequest req) {
        HotelService entity = findServiceById(id);
        entity.setName(req.name().trim());
        entity.setPrice(req.price());
        entity.setHotelId(req.hotelId());
        return toServiceResponse(serviceRepo.save(entity));
    }

    // Xóa dịch vụ
    @Transactional
    public void deleteService(Integer id) {
        if (!serviceRepo.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy dịch vụ #" + id);
        }
        serviceRepo.deleteById(id);
    }

    // Thêm danh sách dịch vụ vào booking
    @Transactional
    public ServiceDto.BookingServiceSummary addServicesToBooking(
            Integer bookingId,
            ServiceDto.AddServicesRequest req) {

        List<ServiceUsage> saved = req.services().stream().map(item -> {
            HotelService svc = findServiceById(item.serviceId());
            BigDecimal total = svc.getPrice()
                    .multiply(BigDecimal.valueOf(item.quantity()));

            // Nếu đã có → cộng dồn số lượng
            if (usageRepo.existsByBookingIdAndServiceId(bookingId, item.serviceId())) {
                ServiceUsage existing = usageRepo
                        .findByBookingId(bookingId)
                        .stream()
                        .filter(u -> u.getServiceId().equals(item.serviceId()))
                        .findFirst().orElseThrow();
                int newQty = existing.getQuantity() + item.quantity();
                existing.setQuantity(newQty);
                existing.setTotalPrice(
                        svc.getPrice().multiply(BigDecimal.valueOf(newQty)));
                return usageRepo.save(existing);
            }

            return usageRepo.save(ServiceUsage.builder()
                    .bookingId(bookingId)
                    .serviceId(item.serviceId())
                    .quantity(item.quantity())
                    .totalPrice(total)
                    .build());
        }).toList();

        return buildSummary(bookingId);
    }

    // Lấy toàn bộ dịch vụ đã dùng của 1 booking
    public ServiceDto.BookingServiceSummary getBookingServices(Integer bookingId) {
        return buildSummary(bookingId);
    }

    // Cập nhật số lượng 1 dịch vụ trong booking
    @Transactional
    public ServiceDto.ServiceUsageResponse updateUsageQuantity(Integer usageId,
                                                               Integer newQuantity) {
        ServiceUsage usage = usageRepo.findById(usageId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy service usage #" + usageId));

        if (newQuantity <= 0) {
            usageRepo.delete(usage);
            // trả về response của item vừa xóa (quantity=0)
            HotelService svc = findServiceById(usage.getServiceId());
            return new ServiceDto.ServiceUsageResponse(
                    usageId, usage.getBookingId(), usage.getServiceId(),
                    svc.getName(), svc.getPrice(), 0, BigDecimal.ZERO);
        }

        HotelService svc = findServiceById(usage.getServiceId());
        usage.setQuantity(newQuantity);
        usage.setTotalPrice(svc.getPrice().multiply(BigDecimal.valueOf(newQuantity)));
        return toUsageResponse(usageRepo.save(usage), svc);
    }

    // Xóa 1 dịch vụ khỏi booking
    @Transactional
    public void removeServiceFromBooking(Integer usageId) {
        if (!usageRepo.existsById(usageId)) {
            throw new EntityNotFoundException("Không tìm thấy service usage #" + usageId);
        }
        usageRepo.deleteById(usageId);
    }

    // Xóa toàn bộ dịch vụ của 1 booking (gọi khi hủy booking)
    @Transactional
    public void clearBookingServices(Integer bookingId) {
        usageRepo.deleteByBookingId(bookingId);
    }

    // private helpers

    private HotelService findServiceById(Integer id) {
        return serviceRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy dịch vụ #" + id));
    }

    private ServiceDto.BookingServiceSummary buildSummary(Integer bookingId) {
        List<ServiceUsage> usages = usageRepo.findByBookingId(bookingId);
        BigDecimal total = usageRepo.sumTotalPriceByBookingId(bookingId);

        List<ServiceDto.ServiceUsageResponse> responses = usages.stream()
                .map(u -> {
                    HotelService svc = serviceRepo.findById(u.getServiceId())
                            .orElse(null);
                    return toUsageResponse(u, svc);
                }).toList();

        return new ServiceDto.BookingServiceSummary(bookingId, responses, total);
    }

    private ServiceDto.ServiceResponse toServiceResponse(HotelService s) {
        return new ServiceDto.ServiceResponse(s.getId(), s.getHotelId(),
                s.getName(), s.getPrice());
    }

    private ServiceDto.ServiceUsageResponse toUsageResponse(ServiceUsage u,
                                                             HotelService svc) {
        return new ServiceDto.ServiceUsageResponse(
                u.getId(), u.getBookingId(), u.getServiceId(),
                svc != null ? svc.getName() : "—",
                svc != null ? svc.getPrice() : BigDecimal.ZERO,
                u.getQuantity(), u.getTotalPrice());
    }
}
