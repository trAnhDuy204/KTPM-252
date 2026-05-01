package com.hotel.backend.services.service;

import com.hotel.backend.services.dto.ServiceDto;
import com.hotel.backend.services.entity.HotelService;
import com.hotel.backend.services.entity.ServiceUsage;
import com.hotel.backend.services.repository.HotelServiceRepository;
import com.hotel.backend.services.repository.ServiceUsageRepository;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("HotelServiceService Tests")
class HotelServiceServiceTest {

    @Mock private HotelServiceRepository serviceRepo;
    @Mock private ServiceUsageRepository usageRepo;

    @InjectMocks private HotelServiceService svc;

    private HotelService spaService() {
        return HotelService.builder()
                .id(1).hotelId(10)
                .name("Spa").price(new BigDecimal("200000"))
                .build();
    }

    private HotelService breakfastService() {
        return HotelService.builder()
                .id(2).hotelId(10)
                .name("Breakfast").price(new BigDecimal("80000"))
                .build();
    }

    private ServiceUsage spaUsage() {
        return ServiceUsage.builder()
                .id(100).bookingId(99).serviceId(1).quantity(2)
                .totalPrice(new BigDecimal("400000"))
                .build();
    }

    // getServicesByHotel()
    @Nested @DisplayName("getServicesByHotel()")
    class GetByHotel {

        @Test @DisplayName("Trả về danh sách dịch vụ của hotel")
        void returnsList() {
            when(serviceRepo.findByHotelId(10))
                    .thenReturn(List.of(spaService(), breakfastService()));

            List<ServiceDto.ServiceResponse> result = svc.getServicesByHotel(10);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).name()).isEqualTo("Spa");
            assertThat(result.get(1).name()).isEqualTo("Breakfast");
        }

        @Test @DisplayName("Trả về rỗng khi hotel không có dịch vụ")
        void emptyList() {
            when(serviceRepo.findByHotelId(99)).thenReturn(List.of());
            assertThat(svc.getServicesByHotel(99)).isEmpty();
        }
    }

    // createService()
    @Nested @DisplayName("createService()")
    class Create {

        @Test @DisplayName("Tạo thành công và trả về response")
        void success() {
            ServiceDto.SaveServiceRequest req = new ServiceDto.SaveServiceRequest(
                    10, "Massage", new BigDecimal("150000"));

            HotelService saved = HotelService.builder()
                    .id(3).hotelId(10).name("Massage")
                    .price(new BigDecimal("150000")).build();

            when(serviceRepo.save(any())).thenReturn(saved);

            ServiceDto.ServiceResponse res = svc.createService(req);

            assertThat(res.name()).isEqualTo("Massage");
            assertThat(res.price()).isEqualByComparingTo("150000");
            verify(serviceRepo).save(any(HotelService.class));
        }

        @Test @DisplayName("Trim tên dịch vụ trước khi lưu")
        void trimName() {
            ServiceDto.SaveServiceRequest req = new ServiceDto.SaveServiceRequest(
                    10, "  Airport Transfer  ", new BigDecimal("100000"));

            when(serviceRepo.save(any())).thenAnswer(inv -> {
                HotelService e = inv.getArgument(0);
                assertThat(e.getName()).isEqualTo("Airport Transfer");
                e.setId(4);
                return e;
            });

            svc.createService(req);
        }
    }

    // updateService()
    @Nested @DisplayName("updateService()")
    class Update {

        @Test @DisplayName("Cập nhật tên và giá thành công")
        void success() {
            when(serviceRepo.findById(1)).thenReturn(Optional.of(spaService()));
            when(serviceRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            ServiceDto.SaveServiceRequest req = new ServiceDto.SaveServiceRequest(
                    10, "Spa Premium", new BigDecimal("350000"));

            ServiceDto.ServiceResponse res = svc.updateService(1, req);

            assertThat(res.name()).isEqualTo("Spa Premium");
            assertThat(res.price()).isEqualByComparingTo("350000");
        }

        @Test @DisplayName("Ném EntityNotFoundException khi dịch vụ không tồn tại")
        void notFound() {
            when(serviceRepo.findById(999)).thenReturn(Optional.empty());

            ServiceDto.SaveServiceRequest req = new ServiceDto.SaveServiceRequest(
                    10, "Test", new BigDecimal("10000"));

            assertThatThrownBy(() -> svc.updateService(999, req))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("#999");
        }
    }

    // deleteService()
    @Nested @DisplayName("deleteService()")
    class Delete {

        @Test @DisplayName("Xóa thành công")
        void success() {
            when(serviceRepo.existsById(1)).thenReturn(true);
            svc.deleteService(1);
            verify(serviceRepo).deleteById(1);
        }

        @Test @DisplayName("Ném EntityNotFoundException khi không tồn tại")
        void notFound() {
            when(serviceRepo.existsById(999)).thenReturn(false);
            assertThatThrownBy(() -> svc.deleteService(999))
                    .isInstanceOf(EntityNotFoundException.class);
            verify(serviceRepo, never()).deleteById(any());
        }
    }

    // addServicesToBooking()
    @Nested @DisplayName("addServicesToBooking()")
    class AddServices {

        @Test @DisplayName("Thêm dịch vụ mới vào booking thành công")
        void newService_success() {
            ServiceDto.AddServicesRequest req = new ServiceDto.AddServicesRequest(
                    List.of(new ServiceDto.ServiceUsageItem(1, 2)));

            when(serviceRepo.findById(1)).thenReturn(Optional.of(spaService()));
            when(usageRepo.existsByBookingIdAndServiceId(99, 1)).thenReturn(false);
            when(usageRepo.save(any())).thenReturn(spaUsage());
            when(usageRepo.findByBookingId(99)).thenReturn(List.of(spaUsage()));
            when(usageRepo.sumTotalPriceByBookingId(99))
                    .thenReturn(new BigDecimal("400000"));

            ServiceDto.BookingServiceSummary summary =
                    svc.addServicesToBooking(99, req);

            assertThat(summary.bookingId()).isEqualTo(99);
            assertThat(summary.usages()).hasSize(1);
            assertThat(summary.totalServiceCost())
                    .isEqualByComparingTo("400000");
        }

        @Test @DisplayName("Cộng dồn số lượng khi dịch vụ đã tồn tại trong booking")
        void existingService_accumulatesQty() {
            ServiceDto.AddServicesRequest req = new ServiceDto.AddServicesRequest(
                    List.of(new ServiceDto.ServiceUsageItem(1, 1))); // thêm 1 nữa

            ServiceUsage existing = spaUsage(); // đang có qty=2

            when(serviceRepo.findById(1)).thenReturn(Optional.of(spaService()));
            when(usageRepo.existsByBookingIdAndServiceId(99, 1)).thenReturn(true);
            when(usageRepo.findByBookingId(99)).thenReturn(List.of(existing));
            when(usageRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(usageRepo.sumTotalPriceByBookingId(99))
                    .thenReturn(new BigDecimal("600000"));

            svc.addServicesToBooking(99, req);

            // qty nên được cộng thành 3
            verify(usageRepo).save(argThat(u -> u.getQuantity() == 3));
        }

        @Test @DisplayName("Ném EntityNotFoundException khi serviceId không tồn tại")
        void serviceNotFound_throws() {
            ServiceDto.AddServicesRequest req = new ServiceDto.AddServicesRequest(
                    List.of(new ServiceDto.ServiceUsageItem(999, 1)));

            when(serviceRepo.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> svc.addServicesToBooking(99, req))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("#999");
        }
    }

    // updateUsageQuantity()
    @Nested @DisplayName("updateUsageQuantity()")
    class UpdateQty {

        @Test @DisplayName("Cập nhật số lượng và tính lại totalPrice")
        void success() {
            when(usageRepo.findById(100)).thenReturn(Optional.of(spaUsage()));
            when(serviceRepo.findById(1)).thenReturn(Optional.of(spaService()));
            when(usageRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            ServiceDto.ServiceUsageResponse res =
                    svc.updateUsageQuantity(100, 3);

            assertThat(res.quantity()).isEqualTo(3);
            assertThat(res.totalPrice()).isEqualByComparingTo("600000");
        }

        @Test @DisplayName("Xóa usage khi quantity <= 0")
        void zeroQty_deletes() {
            when(usageRepo.findById(100)).thenReturn(Optional.of(spaUsage()));
            when(serviceRepo.findById(1)).thenReturn(Optional.of(spaService()));

            ServiceDto.ServiceUsageResponse res =
                    svc.updateUsageQuantity(100, 0);

            verify(usageRepo).delete(any(ServiceUsage.class));
            assertThat(res.quantity()).isEqualTo(0);
        }

        @Test @DisplayName("Ném EntityNotFoundException khi usage không tồn tại")
        void notFound() {
            when(usageRepo.findById(999)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> svc.updateUsageQuantity(999, 1))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    // removeServiceFromBooking()
    @Nested @DisplayName("removeServiceFromBooking()")
    class Remove {

        @Test @DisplayName("Xóa thành công")
        void success() {
            when(usageRepo.existsById(100)).thenReturn(true);
            svc.removeServiceFromBooking(100);
            verify(usageRepo).deleteById(100);
        }

        @Test @DisplayName("Ném EntityNotFoundException khi không tồn tại")
        void notFound() {
            when(usageRepo.existsById(999)).thenReturn(false);
            assertThatThrownBy(() -> svc.removeServiceFromBooking(999))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    // clearBookingServices()
    @Nested @DisplayName("clearBookingServices()")
    class Clear {

        @Test @DisplayName("Gọi deleteByBookingId đúng bookingId")
        void success() {
            svc.clearBookingServices(99);
            verify(usageRepo).deleteByBookingId(99);
        }
    }
}
