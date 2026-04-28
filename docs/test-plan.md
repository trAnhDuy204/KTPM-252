# Kế hoạch Kiểm thử – Hệ thống Quản lý Khách sạn

## 1. Mã định danh Test Plan

TP-HMS-001

---

## 2. Giới thiệu

### 2.1 Mục đích

Tài liệu này mô tả kế hoạch kiểm thử cho hệ thống Quản lý Khách sạn (HMS), bao gồm phạm vi, cách tiếp cận, tài nguyên và lịch trình kiểm thử.

### 2.2 Phạm vi

Hệ thống hỗ trợ quản lý hoạt động khách sạn như đặt phòng, check-in/check-out và thanh toán.

### 2.3 Tài liệu tham chiếu

* Tài liệu đặc tả yêu cầu (SRS)
* Tài liệu thiết kế
* Kế hoạch dự án

---

## 3. Hạng mục kiểm thử (Test Items)

* Module đặt phòng (Booking)
* Module quản lý phòng
* Module quản lý khách sạn
* Module quản lý lễ tân
* Module quản lý khách hàng
* Module quản lý loại phòng, giá
* Module dánh giá sau khi đặt phòng
* Module thanh toán
* Module xác thực (đăng nhập/đăng ký)

---

## 4. Các chức năng cần kiểm thử

* Tìm phòng theo ngày, loại phòng, giá (Khách hàng)
* Đặt phòng, thanh toán (Khách hàng)
* Quản lý đặt phòng (xem, sửa, hủy) (Khách hàng)
* Quản lý phòng, trạng thái phòng (lễ tân)
* Check-in, check-out (lễ tân)
* Xác nhận đặt phòng (lễ tân)
* Quản lý khách sạn (Thêm, xóa, sửa phòng) (Admin)
* Quản lý tài khoản lễ tân (Admin)
* Cấu hình loại phòng, giá (Admin)
* Đăng ký, đăng nhập
* Đánh giá sau khi check out (Khách hàng)

---

## 5. Các chức năng không kiểm thử

* Cổng thanh toán bên thứ ba

---

## 6. Phương pháp tiếp cận

### 6.1 Mức kiểm thử

* Unit Test
* Integration Test
* Manual Test : Kiểm thử toàn bộ luồng người dùng (tìm phòng → đặt phòng → thanh toán → check-in)
* Automation Test : Sử dụng Postman + Newman để kiểm thử API tự động

### 6.2 Loại kiểm thử

* Kiểm thử chức năng (Functional)
* Kiểm thử giao diện (UI)
* Kiểm thử hiệu năng (Performance)

### 6.3 Kỹ thuật kiểm thử

* Kiểm thử hộp đen (Black-box)
* Kiểm thử hộp trắng (White-box: C0, C1)

---

## 7. Tiêu chí Pass/Fail

### Pass

* Test case chạy thành công
* Kết quả thực tế khớp với kỳ vọng

### Fail

* Hệ thống lỗi hoặc trả về kết quả sai

---

## 8. Tiêu chí tạm dừng và tiếp tục

### Tạm dừng

* Xuất hiện lỗi nghiêm trọng (critical)
* Môi trường test gặp sự cố

### Tiếp tục

* Lỗi đã được fix
* Môi trường đã ổn định lại

---

## 9. Sản phẩm bàn giao (Deliverables)

* Test Plan
* Test Case
* Báo cáo lỗi (Bug Report)
* Báo cáo tổng kết test (Test Summary)

---

## 10. Công việc kiểm thử

* Lập kế hoạch
* Thiết kế test case
* Thực thi test
* Ghi nhận và theo dõi lỗi
* Báo cáo

---

## 11. Môi trường kiểm thử

### Phần cứng

* Máy tính/laptop tiêu chuẩn

### Phần mềm

* Hệ điều hành: Windows
* Trình duyệt: Chrome, Edge
* CSDL: PostgreSQL

---

## 12. Lịch trình

| Giai đoạn    | Thời gian |
| ------------ | --------- |
| Lập kế hoạch | 2 ngày    |
| Thiết kế     | 3 ngày    |
| Thực thi     | 5 ngày    |

---

## 13. Rủi ro và phương án xử lý

| Rủi ro            | Mức độ     | Giải pháp           |
| ----------------- | ---------- | ------------------- |
| Thay đổi yêu cầu hệ thống | Cao | Cố định yêu cầu sớm |
| Trùng lịch đặt phòng   | Cao | kiểm tra ràng buộc DB và test boundary |
| Sai phân quyền | Cao | test theo role (RBAC) |
| Dữ liệu test không đầy đủ | Thấp | chuẩn bị dataset đa dạng. |
---

*Xác nhận của Nhóm trưởng: [Trần Hà Anh Duy]*
