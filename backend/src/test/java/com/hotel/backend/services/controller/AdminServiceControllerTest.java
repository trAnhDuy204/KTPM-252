package com.hotel.backend.services.controller;

import com.hotel.backend.services.dto.ServiceDto;
import com.hotel.backend.services.service.HotelServiceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceControllerTest {

    @Mock
    private HotelServiceService serviceService;

    @InjectMocks
    private AdminServiceController adminServiceController;

    @Test
    void getAll_shouldReturnServicesByHotelWhenHotelIdExists() {
        Integer hotelId = 1;
        ServiceDto.ServiceResponse serviceResponse =
                mock(ServiceDto.ServiceResponse.class);
        List<ServiceDto.ServiceResponse> expectedResponse = List.of(serviceResponse);

        when(serviceService.getServicesByHotel(hotelId)).thenReturn(expectedResponse);

        List<ServiceDto.ServiceResponse> result =
                adminServiceController.getAll(hotelId);

        assertThat(result).isSameAs(expectedResponse);
        verify(serviceService).getServicesByHotel(hotelId);
        verify(serviceService, never()).getAllServices();
    }

    @Test
    void getAll_shouldReturnAllServicesWhenHotelIdIsNull() {
        ServiceDto.ServiceResponse serviceResponse =
                mock(ServiceDto.ServiceResponse.class);
        List<ServiceDto.ServiceResponse> expectedResponse = List.of(serviceResponse);

        when(serviceService.getAllServices()).thenReturn(expectedResponse);

        List<ServiceDto.ServiceResponse> result =
                adminServiceController.getAll(null);

        assertThat(result).isSameAs(expectedResponse);
        verify(serviceService).getAllServices();
        verify(serviceService, never()).getServicesByHotel(any());
    }

    @Test
    void create_shouldCreateServiceAndReturnCreatedStatus() {
        ServiceDto.SaveServiceRequest request =
                mock(ServiceDto.SaveServiceRequest.class);
        ServiceDto.ServiceResponse expectedResponse =
                mock(ServiceDto.ServiceResponse.class);

        when(serviceService.createService(request)).thenReturn(expectedResponse);

        ResponseEntity<ServiceDto.ServiceResponse> response =
                adminServiceController.create(request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(serviceService).createService(request);
    }

    @Test
    void update_shouldReturnUpdatedServiceFromService() {
        Integer serviceId = 1;
        ServiceDto.SaveServiceRequest request =
                mock(ServiceDto.SaveServiceRequest.class);
        ServiceDto.ServiceResponse expectedResponse =
                mock(ServiceDto.ServiceResponse.class);

        when(serviceService.updateService(serviceId, request)).thenReturn(expectedResponse);

        ServiceDto.ServiceResponse result =
                adminServiceController.update(serviceId, request);

        assertThat(result).isSameAs(expectedResponse);
        verify(serviceService).updateService(serviceId, request);
    }

    @Test
    void delete_shouldDeleteServiceAndReturnNoContent() {
        Integer serviceId = 1;

        ResponseEntity<Void> response = adminServiceController.delete(serviceId);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        verify(serviceService).deleteService(serviceId);
    }
}
