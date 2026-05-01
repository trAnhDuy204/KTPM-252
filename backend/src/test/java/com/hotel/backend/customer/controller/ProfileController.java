package com.hotel.backend.customer.controller;

import com.hotel.backend.auth.entity.User;
import com.hotel.backend.customer.dto.ProfileDto;
import com.hotel.backend.customer.service.ProfileService;
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
class ProfileControllerTest {

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private ProfileController profileController;

    @Test
    void getProfile_shouldReturnProfileFromService() {
        User user = mock(User.class);
        ProfileDto.ProfileResponse expectedResponse = mock(ProfileDto.ProfileResponse.class);

        when(user.getId()).thenReturn(1);
        when(profileService.getProfile(1)).thenReturn(expectedResponse);

        ResponseEntity<ProfileDto.ProfileResponse> response = profileController.getProfile(user);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(profileService).getProfile(1);
    }

    @Test
    void updateProfile_shouldReturnUpdatedProfileFromService() {
        User user = mock(User.class);
        ProfileDto.UpdateProfileRequest request = mock(ProfileDto.UpdateProfileRequest.class);
        ProfileDto.ProfileResponse expectedResponse = mock(ProfileDto.ProfileResponse.class);

        when(user.getId()).thenReturn(1);
        when(profileService.updateProfile(1, request)).thenReturn(expectedResponse);

        ResponseEntity<ProfileDto.ProfileResponse> response =
                profileController.updateProfile(user, request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(profileService).updateProfile(1, request);
    }

    @Test
    void changePassword_shouldCallServiceAndReturnNoContent() {
        User user = mock(User.class);
        ProfileDto.ChangePasswordRequest request = mock(ProfileDto.ChangePasswordRequest.class);

        when(user.getId()).thenReturn(1);

        ResponseEntity<Void> response = profileController.changePassword(user, request);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        verify(profileService).changePassword(1, request);
    }

    @Test
    void getBookingHistory_shouldReturnBookingHistoryFromService() {
        User user = mock(User.class);
        ProfileDto.BookingItem bookingItem = mock(ProfileDto.BookingItem.class);
        List<ProfileDto.BookingItem> expectedResponse = List.of(bookingItem);

        when(user.getId()).thenReturn(1);
        when(profileService.getBookingHistory(1)).thenReturn(expectedResponse);

        ResponseEntity<List<ProfileDto.BookingItem>> response =
                profileController.getBookingHistory(user);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(profileService).getBookingHistory(1);
    }

    @Test
    void getBookingSummary_shouldReturnBookingSummaryFromService() {
        User user = mock(User.class);
        ProfileDto.BookingSummary expectedResponse = mock(ProfileDto.BookingSummary.class);

        when(user.getId()).thenReturn(1);
        when(profileService.getBookingSummary(1)).thenReturn(expectedResponse);

        ResponseEntity<ProfileDto.BookingSummary> response =
                profileController.getBookingSummary(user);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(expectedResponse);
        verify(profileService).getBookingSummary(1);
    }
}
