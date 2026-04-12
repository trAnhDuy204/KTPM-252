INSERT INTO hotels (name, address, city, description)
SELECT 'Lumière Hotel', '123 Đường Lê Lợi', 'Hồ Chí Minh', 'Khách sạn 5 sao sang trọng tại trung tâm thành phố'
WHERE NOT EXISTS (SELECT 1 FROM hotels LIMIT 1);

UPDATE rooms SET version = 0 WHERE version IS NULL;
