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

### Lấy danh sách loại phòng
**GET** `/admin/room-types`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

**Response:**

```json
[
    {
        "id": 1,
        "hotelId": 1,
        "name": "Standard",
        "capacity": 2,
        "basePrice": 500000.00,
        "description": "Basic room"
    },
    {
        "id": 2,
        "hotelId": 1,
        "name": "Deluxe",
        "capacity": 3,
        "basePrice": 800000.00,
        "description": "Better room"
    },
    {
        "id": 3,
        "hotelId": 2,
        "name": "Standard",
        "capacity": 2,
        "basePrice": 600000.00,
        "description": ""
    },
]
```

### Thêm loại phòng
**POST** `/admin/room-types`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

```json
{
    "hotelId": 1,
    "name": "Standardsssss",
    "capacity": 2,
    "basePrice": 500000.00,
    "description": "Basic room"
}
```

**Response:**

```json
{
    "id": 11,
    "hotelId": 1,
    "name": "Standardsssss",
    "capacity": 2,
    "basePrice": 500000.00,
    "description": "Basic room"
}
```

### Cập nhật loại phòng
**PUT** `/admin/room-types/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
params id = 11
```json
{
    "hotelId": 1,
    "name": "Standardsssssaaaaaaaaaaaa",
    "capacity": 2,
    "basePrice": 500000.00,
    "description": "Basic room"
}
```

**Response:**

```json
{
    "id": 11,
    "hotelId": 1,
    "name": "Standardsssssaaaaaaaaaaaa",
    "capacity": 2,
    "basePrice": 500000.00,
    "description": "Basic room"
}
```
### Xóa loại phòng
**DEL** `/admin/room-types/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
params id = 11

**Response:**

```json
{
  "status": 200,
  "message": "Xóa thành công",
  "errors": null
}
```
### Lấy danh sách nhân viên
**GET** `/admin/users`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"

**Response:**

```json
[
    {
        "id": 1,
        "fullName": "Admin System",
        "email": "admin@gmail.com",
        "password": "$2a$10$Z.r0BIhSqbcd1hTWe3G3gu3TKaJKZpu4Vx0G3pHXxP9acO3th5U62",
        "phone": "0000000000",
        "role": "ADMIN",
        "hotelId": null
    },
    {
        "id": 2,
        "fullName": "Đỗ Minh Quân",
        "email": "user01@gmail.com",
        "password": "$2a$10$Z.r0BIhSqbcd1hTWe3G3gu3TKaJKZpu4Vx0G3pHXxP9acO3th5U62",
        "phone": "0900000001",
        "role": "CUSTOMER",
        "hotelId": null
    }
]
```
### Thêm nhân viên
**POST** `/admin/users`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
```json
{
    "fullName": "Đỗ Minh Quânzzzzzzzz",
        "email": "user11@gmail.com",
        "password": "$2a$10$Z.r0BIhSqbcd1hTWe3G3gu3TKaJKZpu4Vx0G3pHXxP9acO3th5U62",
        "phone": "0900000011",
        "role": "CUSTOMER",
        "hotelId": null
}
```

**Response:**

```json
{
    "id": 17,
    "fullName": "Đỗ Minh Quânzzzzzzzz",
    "email": "user11@gmail.com",
    "password": "$2a$10$Z.r0BIhSqbcd1hTWe3G3gu3TKaJKZpu4Vx0G3pHXxP9acO3th5U62",
    "phone": "0900000011",
    "role": "CUSTOMER",
    "hotelId": null
}
```
### Cập nhật nhân viên
**PUT** `/admin/users/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
```json
{
    "fullName": "Đỗ Minh Quânzzzzzzzzzaaaaaaaaaaaaaaa",
        "email": "user11@gmail.com",
        "password": "$2a$10$Z.r0BIhSqbcd1hTWe3G3gu3TKaJKZpu4Vx0G3pHXxP9acO3th5U62",
        "phone": "0900000011",
        "role": "CUSTOMER",
        "hotelId": null
}
```

**Response:**

```json
{
    "message": "Cập nhật thành công!"
}
```
### Xóa nhân viên
**DEL** `/admin/users/{id}`

**Body:**

Authorization: Bearer Token = Token access role "ADMIN"
Params id = 17

**Response:**

```json
{
  "status": 200,
  "message": "Xóa thành công",
  "errors": null
}
```
---

## 4. Reception API

### Lấy thông tin booking

**GET** `/reception/bookings`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"

**Response:**
```json
[
    {
        "id": 2,
        "roomId": 2,
        "roomNumber": "102",
        "hotelId": 1,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "checkIn": "2026-05-07",
        "checkOut": "2026-05-09",
        "totalPrice": 1000000.00,
        "status": "COMPLETED",
        "guestName": null,
        "guestPhone": null,
        "createdAt": "2026-05-06T00:08:18.726780Z"
    },
    {
        "id": 3,
        "roomId": 3,
        "roomNumber": "103",
        "hotelId": 1,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "checkIn": "2026-05-08",
        "checkOut": "2026-05-10",
        "totalPrice": 1600000.00,
        "status": "PENDING",
        "guestName": null,
        "guestPhone": null,
        "createdAt": "2026-05-06T00:08:18.726780Z"
    }
]
```
### Tạo booking

**POST** `/reception/bookings`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
```json
{
        "roomId": 3,
        "roomNumber": "103",
        "hotelId": 1,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "checkIn": "2026-05-23",
        "checkOut": "2026-05-24",
        "totalPrice": 1600000.00,
        "status": "PENDING",
        "guestName": "Nguen Van A",
        "guestPhone": null
    }
```
**Response:**
```json
{
    "id": 47,
    "roomId": 3,
    "roomNumber": "103",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-23",
    "checkOut": "2026-05-24",
    "totalPrice": 800000.00,
    "status": "PENDING",
    "guestName": "Nguen Van A",
    "guestPhone": null,
    "createdAt": "2026-05-21T11:10:04.583119Z"
}
```
### Xác nhân booking

**POST** `/reception/bookings/{bookingId}/confirm`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 47
**Response:**
```json
{
    "id": 47,
    "roomId": 3,
    "roomNumber": "103",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-23",
    "checkOut": "2026-05-24",
    "totalPrice": 800000.00,
    "status": "CONFIRMED",
    "guestName": "Nguen Van A",
    "guestPhone": null,
    "createdAt": "2026-05-21T11:10:04.583119Z"
}
```
### Check-in phòng

**POST** `/reception/bookings/{bookingId}/check-in`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 47
**Response:**
```json
{
    "id": 47,
    "roomId": 3,
    "roomNumber": "103",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-21",
    "checkOut": "2026-05-24",
    "totalPrice": 800000.00,
    "status": "CHECKED_IN",
    "guestName": "Nguen Van A",
    "guestPhone": null,
    "createdAt": "2026-05-21T11:10:04.583119Z"
}
```

### Tạo check-in

**POST** `/reception/bookings/check-in`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
```json
{
        "roomId": 5,
        "roomNumber": "105",
        "checkOut": "2026-05-24",
        "guestName": "Nguen Van A",
        "guestPhone": null
}
```
**Response:**
```json
{
    "id": 48,
    "roomId": 5,
    "roomNumber": "105",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-21",
    "checkOut": "2026-05-24",
    "totalPrice": 1500000.00,
    "status": "CHECKED_IN",
    "guestName": "Nguen Van A",
    "guestPhone": null,
    "createdAt": "2026-05-21T11:20:08.810591700Z"
}
```
### Check-out phòng

**POST** `/reception/bookings/{bookingId}/check-out`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"

**Response:**
```json
{
    "id": 47,
    "roomId": 3,
    "roomNumber": "103",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-21",
    "checkOut": "2026-05-21",
    "totalPrice": 800000.00,
    "status": "COMPLETED",
    "guestName": "Nguen Van A",
    "guestPhone": null,
    "createdAt": "2026-05-21T11:10:04.583119Z"
}
```

### Cancel phòng

**POST** `/reception/bookings/{bookingId}/cancel`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 8
**Response:**
```json
{
    "id": 8,
    "roomId": 8,
    "roomNumber": "203",
    "hotelId": 2,
    "hotelName": "Ocean View",
    "hotelCity": "Da Nang",
    "checkIn": "2026-05-08",
    "checkOut": "2026-05-10",
    "totalPrice": 1200000.00,
    "status": "CANCELLED",
    "guestName": null,
    "guestPhone": null,
    "createdAt": "2026-05-06T00:08:18.726780Z"
}
```

### Xem booking

**GET** `/reception/bookings/{bookingId}`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 44
**Response:**
```json
{
    "id": 44,
    "roomId": 24,
    "roomNumber": "101",
    "hotelId": 4,
    "hotelName": "City Lights",
    "hotelCity": "Hanoi",
    "checkIn": "2026-05-29",
    "checkOut": "2026-05-31",
    "totalPrice": 2600000.00,
    "status": "CONFIRMED",
    "guestName": null,
    "guestPhone": null,
    "createdAt": "2026-05-06T00:08:18.726780Z"
}
```
### Lấy danh sách phòng

**GET** `/reception/rooms`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"

**Response:**
```json
[
    {
        "id": 4,
        "hotelId": 1,
        "roomTypeId": 2,
        "roomTypeName": "Deluxe",
        "roomTypeCapacity": 3,
        "roomNumber": "104",
        "status": "RESERVED",
        "basePrice": "800000.00",
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM"
    },
    {
        "id": 1,
        "hotelId": 1,
        "roomTypeId": 1,
        "roomTypeName": "Standard",
        "roomTypeCapacity": 2,
        "roomNumber": "101",
        "status": "AVAILABLE",
        "basePrice": "500000.00",
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM"
    }
]
```

### Tạo phòng

**POST** `/reception/rooms`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
```json
{
        "hotelId": 1,
        "roomTypeId": 1,
        "roomTypeName": "Standard",
        "roomTypeCapacity": 2,
        "roomNumber": "106",
        "status": "AVAILABLE",
        "basePrice": "500000.00",
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM"
    }
```
**Response:**
```json
{
    "id": 51,
    "hotelId": 1,
    "roomTypeId": 1,
    "roomTypeName": "Standard",
    "roomTypeCapacity": 2,
    "roomNumber": "106",
    "status": "AVAILABLE",
    "basePrice": "500000.00",
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM"
}
```

### Xem phòng

**GET** `/reception/rooms/{roomId}`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 51
**Response:**
```json
{
    "id": 51,
    "hotelId": 1,
    "roomTypeId": 1,
    "roomTypeName": "Standard",
    "roomTypeCapacity": 2,
    "roomNumber": "106",
    "status": "AVAILABLE",
    "basePrice": "500000.00",
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM"
}
```

### Cập nhật trạng thái phòng

**PATCH** `/reception/rooms/{roomId}/status`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 51
```json
{
    "status":"RESERVED"
}
```
**Response:**
```json
{
    "id": 51,
    "hotelId": 1,
    "roomTypeId": 1,
    "roomTypeName": "Standard",
    "roomTypeCapacity": 2,
    "roomNumber": "106",
    "status": "RESERVED",
    "basePrice": "500000.00",
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM"
}
```

### Xóa phòng

**DEL** `/reception/rooms/{roomId}`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 51
**Response:**
```json
{
  "status": 200,
  "message": "Xóa thành công",
  "errors": null
}
```

### Lấy khách sạn

**GET** `/reception/hotels`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
**Response:**
```json
[
    {
        "id": 1,
        "name": "Sunrise Hotel",
        "city": "HCM"
    },
    {
        "id": 2,
        "name": "Ocean View",
        "city": "Da Nang"
    }
]
```

### Lấy Loại phòng

**GET** `/reception/room-types?hotelId=1`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"

**Response:**
```json
[
    {
        "id": 1,
        "name": "Standard",
        "capacity": 2,
        "basePrice": "500000.00"
    },
    {
        "id": 2,
        "name": "Deluxe",
        "capacity": 3,
        "basePrice": "800000.00"
    }
]
```

### Lấy danh sách hình

**GET** `/reception/rooms/${roomId}/images`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 2
**Response:**
```json
{
    "roomId": 2,
    "total": 3,
    "images": [
        {
            "id": 7,
            "roomId": 2,
            "url": "https://res.cloudinary.com/depkihkr7/image/upload/v1778002823/hotel-rooms/2/spzssnupjgf1vlklgecr.png",
            "publicId": "hotel-rooms/2/spzssnupjgf1vlklgecr",
            "isPrimary": true,
            "caption": null,
            "uploadedAt": "2026-05-06T00:40:23.749558"
        },
        {
            "id": 8,
            "roomId": 2,
            "url": "https://res.cloudinary.com/depkihkr7/image/upload/v1778002834/hotel-rooms/2/r92gwtu4pl9q2vyecfwl.png",
            "publicId": "hotel-rooms/2/r92gwtu4pl9q2vyecfwl",
            "isPrimary": false,
            "caption": null,
            "uploadedAt": "2026-05-06T00:40:34.921133"
        },
        {
            "id": 9,
            "roomId": 2,
            "url": "https://res.cloudinary.com/depkihkr7/image/upload/v1778002842/hotel-rooms/2/sgmrksng6qsrvklrqfqd.png",
            "publicId": "hotel-rooms/2/sgmrksng6qsrvklrqfqd",
            "isPrimary": false,
            "caption": null,
            "uploadedAt": "2026-05-06T00:40:42.669598"
        }
    ]
}
```
### Upload hình

**POST** `/reception/rooms/${roomId}/images`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 2
form-data key = files
**Response:**
```json
[
    {
        "id": 174,
        "roomId": 2,
        "url": "https://res.cloudinary.com/depkihkr7/image/upload/v1779364426/hotel-rooms/2/ouvbnmtco2i97sfizwar.jpg",
        "publicId": "hotel-rooms/2/ouvbnmtco2i97sfizwar",
        "isPrimary": false,
        "caption": null,
        "uploadedAt": "2026-05-21T18:53:45.2034042"
    }
]
```

### Xóa hình

**DEL** `/reception/rooms/${roomId}/images/${imageId}`

**Body:**
Authorization: Bearer Token = Token access role "RECEPTION"
Params id = 2; imageId = 174
**Response:**
```json
{
  "status": 200,
  "message": "Xóa thành công",
  "errors": null
}
```

---

## 5. Customer API

### Lấy bookings

**GET** `/public/bookings?userId=1`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"

**Response:**
```json
[
    {
        "id": 1,
        "roomId": 1,
        "roomNumber": "101",
        "hotelId": 1,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "checkIn": "2026-05-06",
        "checkOut": "2026-05-08",
        "totalPrice": 1000000.00,
        "status": "CANCELLED",
        "guestName": null,
        "guestPhone": null,
        "createdAt": "2026-05-06T00:08:18.726780Z"
    }
]
```

### Tạo bookings

**POST** `/public/bookings`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
```json
    {
        "roomId": 1,
        "roomNumber": "101",
        "hotelId": 1,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "checkIn": "2026-05-26",
        "checkOut": "2026-05-27",
        "totalPrice": 1000000.00,
        "guestName": null,
        "guestPhone": null
    }
```
**Response:**
```json
{
    "id": 49,
    "roomId": 1,
    "roomNumber": "101",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-26",
    "checkOut": "2026-05-27",
    "totalPrice": 500000.00,
    "status": "PENDING",
    "guestName": "Đỗ Minh Quân",
    "guestPhone": "0900000001",
    "createdAt": "2026-05-21T12:05:58.377746500Z"
}
```

### Hủy bookings

**POST** `/public/bookings/{id}/cancel`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
Params id = 49
**Response:**
```json
{
    "id": 49,
    "roomId": 1,
    "roomNumber": "101",
    "hotelId": 1,
    "hotelName": "Sunrise Hotel",
    "hotelCity": "HCM",
    "checkIn": "2026-05-26",
    "checkOut": "2026-05-27",
    "totalPrice": 500000.00,
    "status": "CANCELLED",
    "guestName": "Đỗ Minh Quân",
    "guestPhone": "0900000001",
    "createdAt": "2026-05-21T12:05:58.377747Z"
}
```

### Lấy danh sách loại phòng

**GET** `/public/room-types?hotelId=2`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
**Response:**
```json
[
    {
        "id": 3,
        "name": "Standard",
        "capacity": 2,
        "basePrice": "600000.00"
    },
    {
        "id": 4,
        "name": "Suite",
        "capacity": 4,
        "basePrice": "1200000.00"
    }
]
```

### Lấy danh sách phòng

**GET** `/public/rooms`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
**Response:**
```json
[
    {
        "id": 4,
        "hotelId": 1,
        "roomTypeId": 2,
        "roomTypeName": "Deluxe",
        "roomTypeCapacity": 3,
        "roomNumber": "104",
        "status": "RESERVED",
        "basePrice": "800000.00",
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM"
    },
    {
        "id": 6,
        "hotelId": 1,
        "roomTypeId": 1,
        "roomTypeName": "Standard",
        "roomTypeCapacity": 2,
        "roomNumber": "201",
        "status": "RESERVED",
        "basePrice": "500000.00",
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM"
    },
    {
        "id": 7,
        "hotelId": 1,
        "roomTypeId": 2,
        "roomTypeName": "Deluxe",
        "roomTypeCapacity": 3,
        "roomNumber": "202",
        "status": "RESERVED",
        "basePrice": "800000.00",
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM"
    }
]
```

### Thanh toán

**GET** `/public/payment/vnpay?bookingId=13`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
**Response:**
```
{
https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=80000000&vnp_Command=pay&vnp_CreateDate=20260521191422&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Pay+booking+13&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fpublic%2Fpayment%2Fvnpay-return&vnp_TmnCode=M51QNFEJ&vnp_TxnRef=13&vnp_Version=2.1.0&vnp_SecureHash=0f347405c74f38fbf1fa6042e0ab431598bdb03dc74e98118f6247422f17c72d174c59234e7de3c5e12ab95c9eebbe8da43b7f0fe32fa62b3b24e833098ebe2d
}
```

###  Trả về kết quả

**GET** `/public/payment/vnpay-return`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
**Response:**
```html
<!doctype html>
<html lang="en">

<head>
    <script type="module">
        import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
    </script>

    <script type="module" src="/@vite/client"></script>

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/reception-favicon.svg?v=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hotel Management</title>
</head>

<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>

</html>
```

### Lấy thông tin hồ sơ

**GET** `/profile`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
**Response:**
```json
{
    "id": 2,
    "fullName": "Đỗ Minh Quân",
    "email": "user01@gmail.com",
    "phone": "0900000001",
    "role": "CUSTOMER",
    "createdAt": "06/05/2026 00:07"
}
```

### Cập nhật thông tin hồ sơ

**PUT** `/profile`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
```json
{
    "fullName": "Đỗ Minh Quân",
    "email": "user01@gmail.com",
    "phone": "090000232321",
    "role": "CUSTOMER",
    "createdAt": "06/05/2026 00:07"
}
```
**Response:**
```json
{
    "id": 2,
    "fullName": "Đỗ Minh Quân",
    "email": "user01@gmail.com",
    "phone": "090000232321",
    "role": "CUSTOMER",
    "createdAt": "06/05/2026 00:07"
}
```

### Đổi mật khẩu

**PUT** `/profile/password`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
```json
{
    "newPassword": "Abc12345",
    "confirmPassword": "Abc12345",
    "currentPassword": "Abc123"
}
```
**Response:**
```json
{
  "status": 200,
  "message": "Đổi thành công",
  "errors": null
}
```

### Lấy lịch sử bookings

**GET** `/profile/bookings`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"

**Response:**
```json
[
    {
        "id": 49,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "roomId": 1,
        "roomNumber": "101",
        "roomTypeName": "Standard",
        "checkIn": "26/05/2026",
        "checkOut": "27/05/2026",
        "totalPrice": 500000.00,
        "status": "CANCELLED",
        "createdAt": "21/05/2026 19:05",
        "canReview": false
    },
    {
        "id": 46,
        "hotelName": "Sunrise Hotel",
        "hotelCity": "HCM",
        "roomId": 8,
        "roomNumber": "203",
        "roomTypeName": "Standard",
        "checkIn": "21/05/2026",
        "checkOut": "21/05/2026",
        "totalPrice": 500000.00,
        "status": "COMPLETED",
        "createdAt": "21/05/2026 16:53",
        "canReview": false
    }
]
```

### Lấy thống kê bookings

**GET** `/profile/bookings/summary`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"

**Response:**
```json
{
    "total": 7,
    "pending": 0,
    "confirmed": 4,
    "checkedIn": 0,
    "completed": 1,
    "cancelled": 2
}
```

### Đánh giá phòng

**POST** `/reviews`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
```json
{
    "bookingId": 41,
    "userId": 2,
    "rating": 4
}
```
**Response:**
```json
{
    "id": 47,
    "bookingId": 41,
    "userId": 2,
    "userFullName": "Đỗ Minh Quân",
    "rating": 4,
    "comment": null,
    "createdAt": "2026-05-21T19:38:39.1101692"
}
```

### Xem đánh giá của tôi

**GET** `/reviews/my-bookings`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"

**Response:**
```json
[
    {
        "bookingId": 46,
        "hotelName": "Khách sạn #Sunrise Hotel",
        "roomNumber": "Phòng #203",
        "checkIn": "21/05/2026",
        "checkOut": "21/05/2026",
        "alreadyReviewed": true
    },
    {
        "bookingId": 41,
        "hotelName": "Khách sạn #Mountain Stay",
        "roomNumber": "Phòng #301",
        "checkIn": "21/05/2026",
        "checkOut": "21/05/2026",
        "alreadyReviewed": true
    }
]
```

### Xem đánh giá của một khách sạn

**GET** `/reviews/hotel/{hotelId}`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
Params id = 3
**Response:**
```json
[
    {
        "id": 38,
        "bookingId": 12,
        "userId": 3,
        "userFullName": "Bùi Khánh Linh",
        "rating": 5,
        "comment": "Rất hài lòng, sẽ quay lại",
        "createdAt": "2026-05-06T00:14:14.613944"
    },
    {
        "id": 39,
        "bookingId": 15,
        "userId": 6,
        "userFullName": "Trần Quang Huy",
        "rating": 4,
        "comment": "Khá ổn, nhân viên thân thiện",
        "createdAt": "2026-05-06T00:14:14.613944"
    },
    {
        "id": 47,
        "bookingId": 41,
        "userId": 2,
        "userFullName": "Đỗ Minh Quân",
        "rating": 4,
        "comment": null,
        "createdAt": "2026-05-21T19:38:39.110169"
    }
]
```

### Xem điểm trung bình của khách sạn

**GET** `/reviews/hotel/{hotelId}/rating`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
Params id = 3
**Response:**
```json
{
    "hotelId": 3,
    "averageRating": 4.3,
    "totalReviews": 3
}
```

### Xóa đánh giá

**DEL** `/reviews/{id}`

**Body:**
Authorization: Bearer Token = Token access role "CUSTOMER"
Params id = 47
**Response:**
```json
{
  "status": 200,
  "message": "Xóa thành công",
  "errors": null
}
```

---

## 6. Error Codes

| Code | Meaning      |
| ---- | ------------ |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 404  | Not Found    |
| 500  | Server Error |

---

## 7. Ghi chú

* Tất cả API (trừ login) cần JWT token
* Content-Type: application/json

---

*End of API Docs*
