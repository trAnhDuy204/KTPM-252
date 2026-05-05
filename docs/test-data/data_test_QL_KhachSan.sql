select * from rooms
select * from hotels
select * from payments
select * from users
select * from bookings
select * from service_usages
select * from room_images
select * from services
select * from reviews
select * from room_types

INSERT INTO hotels (name, address, city, description) VALUES
('Sunrise Hotel', '123 Nguyen Hue', 'HCM', 'Luxury hotel center'),
('Ocean View', '456 Tran Hung Dao', 'Da Nang', 'Sea view hotel'),
('Mountain Stay', '789 Le Loi', 'Da Lat', 'Cool weather'),
('City Lights', '101 Hai Ba Trung', 'Hanoi', 'Business hotel'),
('Mekong Lodge', '202 Vo Van Kiet', 'Can Tho', 'Riverside resort');

--Mật khẩu Abc123
INSERT INTO users (full_name, email, password, phone, role, hotel_id) VALUES
('Admin System', 'admin@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0000000000', 'ADMIN', NULL),
('Đỗ Minh Quân', 'user01@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000001', 'CUSTOMER', NULL),
('Bùi Khánh Linh', 'user02@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000002', 'CUSTOMER', NULL),
('Trần Hà Anh Duy', 'user03@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000003', 'CUSTOMER', NULL),
('Nguyễn Minh Anh', 'user04@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000004', 'CUSTOMER', NULL),
('Trần Quang Huy', 'user05@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000005', 'CUSTOMER', NULL),
('Lê Thị Ngọc Mai', 'user06@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000006', 'CUSTOMER', NULL),
('Phạm Tuấn Kiệt', 'user07@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000007', 'CUSTOMER', NULL),
('Hoàng Gia Bảo', 'user08@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000008', 'CUSTOMER', NULL),
('Đặng Thanh Trúc', 'user09@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000009', 'CUSTOMER', NULL),
('Võ Hoài Nam', 'user010@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0900000010', 'CUSTOMER', NULL),
('Nguyễn Văn Lễ Tân 1', 'rep01@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0911111111', 'RECEPTION', 1),
('Trần Thị Lễ Tân 2', 'rep02@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0922222222', 'RECEPTION', 2),
('Lê Văn Lễ Tân 3', 'rep03@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0933333333', 'RECEPTION', 3),
('Phạm Thị Lễ Tân 4', 'rep04@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0944444444', 'RECEPTION', 4),
('Hoàng Văn Lễ Tân 5', 'rep05@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36h7eY7d3sJr9E5p5Y5Y5G2', '0955555555', 'RECEPTION', 5);

INSERT INTO room_types (hotel_id, name, capacity, base_price, description) VALUES
(1, 'Standard', 2, 500000, 'Basic room'),
(1, 'Deluxe', 3, 800000, 'Better room'),
(2, 'Standard', 2, 600000, ''),
(2, 'Suite', 4, 1200000, ''),
(3, 'Standard', 2, 400000, ''),
(3, 'Deluxe', 3, 700000, ''),
(4, 'Standard', 2, 550000, ''),
(4, 'Suite', 4, 1300000, ''),
(5, 'Bungalow', 2, 900000, ''),
(5, 'Family', 5, 1500000, '');

INSERT INTO rooms (hotel_id, room_type_id, room_number, status) VALUES
(1,1,'101','AVAILABLE'),(1,1,'102','AVAILABLE'),(1,2,'103','OCCUPIED'),
(1,2,'104','AVAILABLE'),(1,1,'105','CLEANING'),(1,1,'106','AVAILABLE'),
(1,2,'107','OCCUPIED'),
(1,1,'108','AVAILABLE'),
(1,2,'109','AVAILABLE'),
(1,1,'110','MAINTENANCE'),

(2,3,'201','AVAILABLE'),(2,3,'202','AVAILABLE'),(2,4,'203','OCCUPIED'),
(2,4,'204','AVAILABLE'),(2,3,'205','MAINTENANCE'),(2,3,'206','AVAILABLE'),
(2,4,'207','AVAILABLE'),
(2,3,'208','OCCUPIED'),
(2,4,'209','AVAILABLE'),
(2,3,'210','CLEANING'),

(3,5,'301','AVAILABLE'),(3,6,'302','AVAILABLE'),(3,5,'303','OCCUPIED'),
(3,6,'304','AVAILABLE'),(3,5,'305','AVAILABLE'),(3,5,'306','AVAILABLE'),
(3,6,'307','AVAILABLE'),
(3,5,'308','OCCUPIED'),
(3,6,'309','AVAILABLE'),
(3,5,'310','AVAILABLE'),

(4,7,'401','AVAILABLE'),(4,8,'402','OCCUPIED'),(4,7,'403','AVAILABLE'),
(4,8,'404','AVAILABLE'),(4,7,'405','CLEANING'),(4,7,'406','AVAILABLE'),
(4,8,'407','AVAILABLE'),
(4,7,'408','OCCUPIED'),
(4,8,'409','AVAILABLE'),
(4,7,'410','AVAILABLE'),

(5,9,'501','AVAILABLE'),(5,10,'502','OCCUPIED'),(5,9,'503','AVAILABLE'),
(5,10,'504','AVAILABLE'),(5,9,'505','AVAILABLE'),(5,9,'506','AVAILABLE'),
(5,10,'507','AVAILABLE'),
(5,9,'508','OCCUPIED'),
(5,10,'509','AVAILABLE'),
(5,9,'510','AVAILABLE');

INSERT INTO bookings (user_id, hotel_id, room_id, check_in, check_out, total_price, status) VALUES
(2,1,1,'2026-05-06','2026-05-08',1000000,'CONFIRMED'),
(3,1,2,'2026-05-07','2026-05-09',1000000,'COMPLETED'),
(4,1,3,'2026-05-08','2026-05-10',1600000,'PENDING'),
(5,1,4,'2026-05-09','2026-05-11',1600000,'CANCELLED'),
(6,1,5,'2026-05-10','2026-05-12',1000000,'CONFIRMED'),

(7,2,6,'2026-05-06','2026-05-07',600000,'COMPLETED'),
(8,2,7,'2026-05-07','2026-05-09',1200000,'CONFIRMED'),
(9,2,8,'2026-05-08','2026-05-10',1200000,'PENDING'),
(10,2,9,'2026-05-09','2026-05-11',2400000,'CONFIRMED'),
(11,2,10,'2026-05-10','2026-05-12',600000,'CANCELLED'),

(2,3,11,'2026-05-06','2026-05-08',800000,'CONFIRMED'),
(3,3,12,'2026-05-07','2026-05-09',1400000,'COMPLETED'),
(4,3,13,'2026-05-08','2026-05-10',800000,'PENDING'),
(5,3,14,'2026-05-09','2026-05-11',1400000,'CONFIRMED'),
(6,3,15,'2026-05-10','2026-05-12',800000,'COMPLETED'),

(7,4,16,'2026-05-06','2026-05-08',1100000,'CONFIRMED'),
(8,4,17,'2026-05-07','2026-05-09',2600000,'COMPLETED'),
(9,4,18,'2026-05-08','2026-05-10',1100000,'PENDING'),
(10,4,19,'2026-05-09','2026-05-11',2600000,'CONFIRMED'),
(11,4,20,'2026-05-10','2026-05-12',1100000,'CANCELLED'),

(2,5,21,'2026-05-06','2026-05-08',1800000,'CONFIRMED'),
(3,5,22,'2026-05-07','2026-05-09',3000000,'COMPLETED'),
(4,5,23,'2026-05-08','2026-05-10',1800000,'PENDING'),
(5,5,24,'2026-05-09','2026-05-11',3000000,'CONFIRMED'),
(6,5,25,'2026-05-10','2026-05-12',1800000,'COMPLETED'),

(7,1,6,'2026-05-11','2026-05-13',1000000,'CONFIRMED'),
(8,2,7,'2026-05-12','2026-05-14',1200000,'COMPLETED'),
(9,3,8,'2026-05-13','2026-05-15',800000,'PENDING'),
(10,4,9,'2026-05-14','2026-05-16',2600000,'CONFIRMED'),
(11,5,10,'2026-05-15','2026-05-17',1800000,'CANCELLED'),

(2,1,11,'2026-05-16','2026-05-18',1000000,'CONFIRMED'),
(3,2,12,'2026-05-17','2026-05-19',1200000,'COMPLETED'),
(4,3,13,'2026-05-18','2026-05-20',800000,'PENDING'),
(5,4,14,'2026-05-19','2026-05-21',2600000,'CONFIRMED'),
(6,5,15,'2026-05-20','2026-05-22',1800000,'COMPLETED'),

(7,1,16,'2026-05-21','2026-05-23',1000000,'CONFIRMED'),
(8,2,17,'2026-05-22','2026-05-24',1200000,'COMPLETED'),
(9,3,18,'2026-05-23','2026-05-25',800000,'PENDING'),
(10,4,19,'2026-05-24','2026-05-26',2600000,'CONFIRMED'),
(11,5,20,'2026-05-25','2026-05-27',1800000,'CANCELLED'),

(2,1,21,'2026-05-26','2026-05-28',1000000,'CONFIRMED'),
(3,2,22,'2026-05-27','2026-05-29',1200000,'COMPLETED'),
(4,3,23,'2026-05-28','2026-05-30',800000,'PENDING'),
(5,4,24,'2026-05-29','2026-05-31',2600000,'CONFIRMED'),
(6,5,25,'2026-05-30','2026-06-01',1800000,'COMPLETED');

INSERT INTO payments (booking_id, amount, payment_method, status, paid_at) VALUES
(1,1000000,'CARD','PAID',NOW()),
(2,1200000,'CASH','PAID',NOW()),
(3,800000,'BANK','PENDING',NULL),
(4,550000,'CARD','FAILED',NULL),
(5,1800000,'BANK','PAID',NOW());

INSERT INTO services (hotel_id, name, price) VALUES
(1,'Breakfast',100000),
(1,'Spa',300000),
(2,'Laundry',80000),
(2,'Airport Pickup',200000),
(3,'Bike Rental',50000),
(3,'Coffee',40000),
(4,'Gym',0),
(4,'Meeting Room',500000),
(5,'Boat Tour',250000),
(5,'Dinner',200000);


INSERT INTO service_usages (booking_id, service_id, quantity, total_price) VALUES
(1,1,2,200000),
(1,2,1,300000),
(2,3,3,240000),
(3,5,1,50000),
(5,10,2,400000);


INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES
(2,3,5,'Phòng sạch sẽ, dịch vụ tốt'),
(6,7,4,'Ổn, giá hợp lý'),
(12,3,5,'Rất hài lòng, sẽ quay lại'),
(15,6,4,'Khá ổn, nhân viên thân thiện'),
(17,8,5,'View đẹp, phòng rộng'),
(22,3,5,'Resort rất chill'),
(27,8,4,'Dịch vụ tốt, ăn sáng ổn'),
(32,3,5,'Trải nghiệm tuyệt vời'),
(37,8,4,'Ổn trong tầm giá'),
(42,3,5,'Rất đáng tiền');