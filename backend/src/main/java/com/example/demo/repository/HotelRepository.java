package com.example.demo.repository;

import com.example.demo.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {
    boolean existsByNameIgnoreCaseAndCityIgnoreCaseAndAddressIgnoreCase(String name, String city, String address);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(h) > 0 FROM Hotel h WHERE " +
           "LOWER(h.name) = LOWER(:name) AND " +
           "LOWER(h.city) = LOWER(:city) AND " +
           "LOWER(h.address) = LOWER(:address) AND " +
           "h.id <> :id")
    boolean existsDuplicate(@org.springframework.data.repository.query.Param("name") String name, 
                             @org.springframework.data.repository.query.Param("city") String city, 
                             @org.springframework.data.repository.query.Param("address") String address, 
                             @org.springframework.data.repository.query.Param("id") Integer id);
}