# API Documentation – Hotel Management System (HMS)

---

## 1. Giới thiệu

Tài liệu mô tả các API của hệ thống quản lý khách sạn.
Base URL: `http://localhost:8080/api`

---

## 2. Authentication

### Đăng nhập

**POST** `/auth/login`

**Body:**

```json
{
  "email": "admin@gmail.com",
  "password": "Abc123"
}
```

**Response:**

```json
{
  "token": "jwt_token",
  "user": { "id": 1, "role": "admin" }
}
```

---

## 3. Room API

### 📌 Lấy danh sách phòng

**GET** `/rooms`

### 📌 Thêm phòng

**POST** `/rooms`

**Body:**

```json
{
  "name": "Room 101",
  "type": "deluxe",
  "price": 500000
}
```

### 📌 Cập nhật phòng

**PUT** `/rooms/:id`

### 📌 Xóa phòng

**DELETE** `/rooms/:id`

---

## 4. Booking API

### 📌 Đặt phòng

**POST** `/bookings`

**Body:**

```json
{
  "room_id": 1,
  "check_in": "2026-04-25",
  "check_out": "2026-04-27"
}
```

### 📌 Danh sách booking

**GET** `/bookings`

### 📌 Hủy booking

**DELETE** `/bookings/:id`

---

## 5. Check-in / Check-out

### ✅ Check-in

**POST** `/checkin`

### ✅ Check-out

**POST** `/checkout`

---

## 6. Payment API

### 💳 Thanh toán

**POST** `/payments`

**Body:**

```json
{
  "booking_id": 1,
  "amount": 1000000,
  "method": "cash"
}
```

---

## 7. Customer API

### 👤 Danh sách khách

**GET** `/customers`

### 👤 Thêm khách

**POST** `/customers`

---

## 8. Response Format

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

---

## 9. Error Codes

| Code | Meaning      |
| ---- | ------------ |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 404  | Not Found    |
| 500  | Server Error |

---

## 10. Ghi chú

* Tất cả API (trừ login) cần JWT token
* Content-Type: application/json

---

*End of API Docs*
