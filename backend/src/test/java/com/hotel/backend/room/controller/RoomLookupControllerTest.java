package com.hotel.backend.room.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hotel.backend.auth.service.CustomUserDetailsService;
import com.hotel.backend.config.SecurityConfig;
import com.hotel.backend.security.JwtService;
import com.hotel.backend.hotel.entity.Hotel;
import com.hotel.backend.hotel.repository.HotelRepository;
import com.hotel.backend.room.entity.RoomType;
import com.hotel.backend.room.repository.RoomTypeRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RoomLookupController.class)
@Import(SecurityConfig.class)
@WithMockUser(roles = "RECEPTION")
class RoomLookupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HotelRepository hotelRepository;

    @MockitoBean
    private RoomTypeRepository roomTypeRepository;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // ==================== GET /api/reception/hotels ====================

    @Nested
    class GetHotels {

        @Test
        void shouldReturnListOfHotels() throws Exception {
            Hotel hotel1 = buildHotel(1, "Grand Hotel", "Hanoi");
            Hotel hotel2 = buildHotel(2, "Beach Resort", "Da Nang");

            when(hotelRepository.findAll()).thenReturn(List.of(hotel1, hotel2));

            mockMvc.perform(get("/api/reception/hotels"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id", is(1)))
                    .andExpect(jsonPath("$[0].name", is("Grand Hotel")))
                    .andExpect(jsonPath("$[0].city", is("Hanoi")))
                    .andExpect(jsonPath("$[1].id", is(2)))
                    .andExpect(jsonPath("$[1].name", is("Beach Resort")))
                    .andExpect(jsonPath("$[1].city", is("Da Nang")));
        }

        @Test
        void shouldReturnEmptyListWhenNoHotels() throws Exception {
            when(hotelRepository.findAll()).thenReturn(List.of());

            mockMvc.perform(get("/api/reception/hotels"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // ==================== GET /api/reception/room-types ====================

    @Nested
    class GetRoomTypes {

        @Test
        void shouldReturnRoomTypesForHotel() throws Exception {
            Hotel hotel = buildHotel(1, "Grand Hotel", "Hanoi");
            RoomType rt1 = buildRoomType(1, hotel, "Standard", 2, new BigDecimal("500000.00"));
            RoomType rt2 = buildRoomType(2, hotel, "Deluxe", 4, new BigDecimal("1200000.50"));

            when(roomTypeRepository.findByHotel_Id(1)).thenReturn(List.of(rt1, rt2));

            mockMvc.perform(get("/api/reception/room-types").param("hotelId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id", is(1)))
                    .andExpect(jsonPath("$[0].name", is("Standard")))
                    .andExpect(jsonPath("$[0].capacity", is(2)))
                    .andExpect(jsonPath("$[0].basePrice", is("500000.00")))
                    .andExpect(jsonPath("$[1].id", is(2)))
                    .andExpect(jsonPath("$[1].name", is("Deluxe")))
                    .andExpect(jsonPath("$[1].capacity", is(4)))
                    .andExpect(jsonPath("$[1].basePrice", is("1200000.50")));
        }

        @Test
        void shouldReturnEmptyListWhenNoRoomTypesForHotel() throws Exception {
            when(roomTypeRepository.findByHotel_Id(99)).thenReturn(List.of());

            mockMvc.perform(get("/api/reception/room-types").param("hotelId", "99"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void shouldReturn400WhenHotelIdParamMissing() throws Exception {
            mockMvc.perform(get("/api/reception/room-types"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== Helpers ====================

    private Hotel buildHotel(Integer id, String name, String city) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName(name);
        hotel.setCity(city);
        return hotel;
    }

    private RoomType buildRoomType(Integer id, Hotel hotel, String name, Integer capacity, BigDecimal basePrice) {
        RoomType roomType = new RoomType();
        roomType.setId(id);
        roomType.setHotel(hotel);
        roomType.setName(name);
        roomType.setCapacity(capacity);
        roomType.setBasePrice(basePrice);
        return roomType;
    }

    // ==================== Authorization ====================

    @Nested
    class Authorization {

        @Test
        @WithMockUser(roles = "CUSTOMER")
        void shouldReturn403WhenNotReceptionRole() throws Exception {
            mockMvc.perform(get("/api/reception/hotels"))
                    .andExpect(status().isForbidden());
        }
    }
}
