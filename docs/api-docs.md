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
  "accessToken": "Token access",
    "refreshToken": "Token refresh",
    "tokenType": "Bearer",
    "user": {
        "id": 1,
        "fullName": "admin",
        "email": "admin@gmail.com",
        "phone": null,
        "role": "ADMIN",
        "hotelId": null
    }
}
```
### Đăng kí

**POST** `/auth/register`

**Body:**

```json
{
  "email": "ad123@gmail.com",
  "password": "Abc123456",
  "fullName": "Anh Duy",
  "phone":"0823069390",
  "role":"CUSTOMER"
}
```

**Response:**

```json
{
  "accessToken": "Token access",
    "refreshToken": "Token refresh",
    "tokenType": "Bearer",
    "user": {
        "id": 9,
        "fullName": "Anh Duy",
        "email": "ad123@gmail.com",
        "phone": "0823069390",
        "role": "CUSTOMER",
        "hotelId": null
    }
}
```

### Tải lại token

**POST** `/auth/refresh`

**Body:**

```json
{
  "refreshToken": "Token refresh"
}
```

**Response:**

```json
{
  "accessToken": "New Token access",
    "refreshToken": "New token refresh",
    "tokenType": "Bearer",
    "user": {
        "id": 9,
        "fullName": "Anh Duy",
        "email": "ad123@gmail.com",
        "phone": "0823069390",
        "role": "CUSTOMER",
        "hotelId": null
    }
}
```
---

## 3. Admin API

### Lấy danh sách booking
**GET** `/admin/bookings`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

**Response:**

```json
[
  {
    "id": 1,
    "userId": 2,
    "hotelId": 2,
    "roomId": 1,
    "checkIn": "2025-04-01",
    "checkOut": "2025-04-03",
    "totalPrice": 1000000.00,
    "status": "COMPLETED",
    "createdAt": "2026-04-05T08:01:20.380486Z",
    "guestName": null,
    "guestPhone": null
  },
  {
    "id": 2,
    "userId": 5,
    "hotelId": 2,
    "roomId": 2,
    "checkIn": "2025-04-05",
    "checkOut": "2025-04-07",
    "totalPrice": 1200000.00,
    "status": "COMPLETED",
    "createdAt": "2026-04-05T08:01:20.380486Z",
    "guestName": null,
    "guestPhone": null
  }
]
```

### Lấy danh sách khách sạn
**GET** `/admin/hotels`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

**Response:**

```json
[
  {
    "id": 1,
    "name": "Sunrise Hotel",
    "address": "123 Beach Road",
    "city": "Da Nang",
    "description": "Khách sạn gần biển"
  },
  {
    "id": 2,
    "name": "Mountain View Hotel",
    "address": "456 Hill St",
    "city": "Da Lat",
    "description": "View núi đẹp"
  }
]
```

### Tạo khách sạn
**POST** `/admin/hotels`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

```json
{
  "name":"Hoa Hong Hotel",
  "address":"46 Nguyen Trai",
  "city":"Da Lat",
  "description":"khách sạn đẹp, view núi"
}
```

**Response:**

```json
{
  "id": 4,
  "name": "Hoa Hong Hotel",
  "address": "46 Nguyen Trai",
  "city": "Da Lat",
  "description": "khách sạn đẹp, view núi"
}
```

### Cập nhật khách sạn
**PUT** `/admin/hotels/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
Params: id = 4

```json
{
  "name":"Hoa Hong Hotel",
  "address":"50 Nguyen Trai",
  "city":"Da Lat",
  "description":"khách sạn đẹp, view núi"
}
```

**Response:**

```json
{
  "id": 4,
  "name": "Hoa Hong Hotel",
  "address": "50 Nguyen Trai",
  "city": "Da Lat",
  "description": "khách sạn đẹp, view núi",
  "createdAt": "2026-04-28T20:01:48.421091Z"
}
```

### Xóa khách sạn
**DELETE** `/admin/hotels/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
Params: id = 4

**Response:**

```json
{
  "status": 200,
  "message": "Xóa khách sạn thành công",
  "errors": null
}
```

---

## 3. Room API

### Lấy danh sách phòng
**GET** `/admin/rooms`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

**Response:**

```json
[
  {
    "id": 2,
        "roomNumber": "102",
        "status": "AVAILABLE",
        "hotelId": 2,
        "roomType": {
            "id": 1,
            "hotelId": 2,
            "name": "Standard",
            "capacity": 2,
            "basePrice": 500000.00,
            "description": "Phòng tiêu chuẩn"
        }
  },
  {
    "id": 6,
        "roomNumber": "103",
        "status": "CLEANING",
        "hotelId": 2,
        "roomType": {
            "id": 1,
            "hotelId": 2,
            "name": "Standard",
            "capacity": 2,
            "basePrice": 500000.00,
            "description": "Phòng tiêu chuẩn"
        }
  }
]
```
### Tạo phòng
**POST** `/admin/rooms`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

```json
{
  "hotelId": 2,
  "roomType": {
    "id": 2,
    "hotelId": 2,
    "name": "Deluxe",
    "capacity": 4,
    "basePrice": 800000.00,
    "description": "Phòng cao cấp"
  },
  "roomNumber":"202",
  "status":"AVAILABLE"
}
```

**Response:**

```json
{
    "id": 11,
    "roomNumber": "202",
    "status": "AVAILABLE",
    "hotelId": 2,
    "roomType": {
        "id": 2,
        "hotelId": 2,
        "name": "Deluxe",
        "capacity": 4,
        "basePrice": 800000.00,
        "description": "Phòng cao cấp"
    }
}
```

### Cập nhật phòng
**PUT** `/admin/rooms/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
Params: id = 11

```json
{
  "hotelId": 2,
  "roomType": {
    "id": 2,
    "hotelId": 2,
    "name": "Deluxe",
    "capacity": 4,
    "basePrice": 800000.00,
    "description": "Phòng cao cấp"
  },
  "roomNumber":"202",
  "status":"CLEANING"
}
```

**Response:**

```json
{
    "id": 11,
    "roomNumber": "202",
    "status": "CLEANING",
    "hotelId": 2,
    "roomType": {
        "id": 2,
        "hotelId": 2,
        "name": "Deluxe",
        "capacity": 4,
        "basePrice": 800000.00,
        "description": "Phòng cao cấp"
    }
}
```
### Xóa phòng
**DELETE** `/admin/rooms/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
Params: id = 11

**Response:**

```json
{
  "status": 200,
  "message": "Xóa phòng thành công",
  "errors": null
}
```

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
