package com.hotel.backend.services.controller;

import com.hotel.backend.services.dto.ServiceDto;
import com.hotel.backend.services.service.HotelServiceService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicServiceControllerTest {

    @Mock
    private HotelServiceService serviceService;

    @InjectMocks
    private PublicServiceController publicServiceController;

    @Test
    void getServicesByHotel_shouldReturnServicesFromService() {
        Integer hotelId = 1;
        ServiceDto.ServiceResponse serviceResponse =
                mock(ServiceDto.ServiceResponse.class);
        List<ServiceDto.ServiceResponse> expectedResponse = List.of(serviceResponse);

        when(serviceService.getServicesByHotel(hotelId)).thenReturn(expectedResponse);

        List<ServiceDto.ServiceResponse> result =
                publicServiceController.getServicesByHotel(hotelId);

        assertThat(result).isSameAs(expectedResponse);
        verify(serviceService).getServicesByHotel(hotelId);
    }

    @Test
    void getServiceById_shouldThrowWhenServiceNotFound() {
        ServiceDto.ServiceResponse serviceResponse =
                mock(ServiceDto.ServiceResponse.class);

        when(serviceResponse.id()).thenReturn(2);
        when(serviceService.getAllServices()).thenReturn(List.of(serviceResponse));

        assertThatThrownBy(() -> publicServiceController.getServiceById(99))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("Không tìm thấy dịch vụ #99");

        verify(serviceService).getAllServices();
    }

    @Test
    void addServices_shouldAddServicesToBookingAndReturnCreatedStatus() {
        Integer bookingId = 10;
        ServiceDto.AddServicesRequest request =
                mock(ServiceDto.AddServicesRequest.class);
        ServiceDto.BookingServiceSummary expectedResponse =
                mock(ServiceDto.BookingServiceSummary.class);

        when(serviceService.addServicesToBooking(bookingId, request))
                .thenReturn(expectedResponse);

        ResponseEntity<ServiceDto.BookingServiceSummary> response =
                publicServiceController.addServices(bookingId, request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(serviceService).addServicesToBooking(bookingId, request);
    }

    @Test
    void getBookingServices_shouldReturnBookingServicesFromService() {
        Integer bookingId = 10;
        ServiceDto.BookingServiceSummary expectedResponse =
                mock(ServiceDto.BookingServiceSummary.class);

        when(serviceService.getBookingServices(bookingId)).thenReturn(expectedResponse);

        ServiceDto.BookingServiceSummary result =
                publicServiceController.getBookingServices(bookingId);

        assertThat(result).isSameAs(expectedResponse);
        verify(serviceService).getBookingServices(bookingId);
    }

    @Test
    void updateQuantity_shouldUpdateUsageQuantityAndReturnResponse() {
        Integer usageId = 5;
        PublicServiceController.UpdateQuantityRequest request =
                new PublicServiceController.UpdateQuantityRequest(3);
        ServiceDto.ServiceUsageResponse expectedResponse =
                mock(ServiceDto.ServiceUsageResponse.class);

        when(serviceService.updateUsageQuantity(usageId, 3))
                .thenReturn(expectedResponse);

        ServiceDto.ServiceUsageResponse result =
                publicServiceController.updateQuantity(usageId, request);

        assertThat(result).isSameAs(expectedResponse);
        verify(serviceService).updateUsageQuantity(usageId, 3);
    }

    @Test
    void removeUsage_shouldRemoveServiceFromBookingAndReturnNoContent() {
        Integer usageId = 5;

        ResponseEntity<Void> response = publicServiceController.removeUsage(usageId);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        verify(serviceService).removeServiceFromBooking(usageId);
    }
}
