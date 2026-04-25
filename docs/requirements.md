# Phân tích yêu cầu – Hệ thống Quản lý Khách sạn (HMS)

---

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả các yêu cầu chức năng và phi chức năng của hệ thống Quản lý Khách sạn (Hotel Management System – HMS). Đây là cơ sở để thiết kế, phát triển và kiểm thử hệ thống.

### 1.2 Phạm vi hệ thống

Hệ thống hỗ trợ quản lý toàn bộ hoạt động khách sạn, bao gồm:

* Quản lý phòng
* Đặt phòng
* Check-in / Check-out
* Quản lý khách hàng
* Thanh toán
* Quản trị hệ thống

---

## 2. Stakeholders (Các bên liên quan)

| Vai trò          | Mô tả                            |
| ---------------- | -------------------------------- |
| Khách hàng       | Người đặt phòng, sử dụng dịch vụ |
| Nhân viên lễ tân | Thực hiện check-in/check-out     |
| Admin            | Quản lý hệ thống                 |

---

## 3. Yêu cầu chức năng (Functional Requirements)

### 3.1 Quản lý phòng

* Thêm / sửa / xóa phòng
* Phân loại phòng (standard, deluxe...)
* Cập nhật trạng thái phòng (trống, đã đặt, đang sử dụng)

### 3.2 Đặt phòng (Booking)

* Tìm phòng theo ngày
* Đặt phòng
* Hủy đặt phòng
* Kiểm tra tình trạng phòng trống

### 3.3 Check-in / Check-out

* Check-in khách hàng
* Check-out và tính tiền
* Cập nhật trạng thái phòng

### 3.4 Quản lý khách hàng

* Lưu thông tin khách
* Tạo quản lý

### 3.5 Thanh toán

* Tính tiền theo thời gian lưu trú
* Hỗ trợ phương thức thanh toán của bên thứ 3
* Xuất hóa đơn

### 3.6 Xác thực người dùng

* Đăng ký
* Đăng nhập
* Phân quyền (admin, staff)

### 3.7 Báo cáo

* Doanh thu
* Tỷ lệ phòng sử dụng

---

## 4. Yêu cầu phi chức năng (Non-functional Requirements)

### 4.1 Hiệu năng

* Hệ thống phản hồi < 2 giây
* Hỗ trợ nhiều người dùng đồng thời

### 4.2 Bảo mật

* Mã hóa mật khẩu
* Phân quyền truy cập

### 4.3 Khả dụng

* Giao diện dễ sử dụng
* Hoạt động ổn định 24/7

### 4.4 Khả mở rộng

* Dễ thêm module mới

### 4.5 Tính tương thích

* Hỗ trợ trình duyệt Chrome, Edge

---

## 5. Use Case (ví dụ)

| Use Case      | Actor      | Mô tả              |
| ------------- | ---------- | ------------------ |
| Đặt phòng     | Khách hàng | Chọn phòng và đặt  |
| Check-in      | Nhân viên  | Xác nhận khách đến |
| Thanh toán    | Nhân viên  | Thu tiền           |
| Quản lý phòng | Admin      | Cập nhật phòng     |

---

## 6. Ràng buộc hệ thống

* Phải sử dụng cơ sở dữ liệu (PostgreSQL)
* Hệ thống web-based
* Tuân thủ quy trình nghiệp vụ khách sạn

---

## 7. Giả định

* Người dùng có kết nối internet
* Dữ liệu nhập là hợp lệ (trừ test case lỗi)

---

## 8. Rủi ro

| Rủi ro           | Mô tả               |
| ---------------- | ------------------- |
| Nhập sai dữ liệu | Gây lỗi hệ thống    |
| Quá tải hệ thống | Giảm hiệu năng      |
| Lỗi thanh toán   | Ảnh hưởng tài chính |

---

## 9. Kết luận

Tài liệu này là nền tảng cho việc thiết kế, phát triển và kiểm thử hệ thống HMS. Các yêu cầu có thể được cập nhật trong quá trình phát triển.

---

*Xác nhận của Nhóm trưởng: [Trần Hà Anh Duy]*
