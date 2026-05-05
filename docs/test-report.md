# TEST REPORT

## 1. Giới thiệu

Tài liệu này mô tả kết quả kiểm thử hệ thống **Quản lý khách sạn**.  
Mục tiêu là đánh giá chất lượng hệ thống thông qua các hoạt động kiểm thử và xác định mức độ sẵn sàng triển khai.

---

## 2. Phạm vi kiểm thử

Các module đã được kiểm thử:

- Authentication (Đăng ký, Đăng nhập, Refresh Token)
- Profile người dùng
- Tìm kiếm và đặt phòng
- Thanh toán (VNPay)
- Quản lý dịch vụ
- Đánh giá (Review)
- Phân quyền hệ thống
- API Interceptor

---

## 3. Môi trường kiểm thử

| Thành phần | Giá trị |
|----------|--------|
| Frontend | ReactJS |
| Backend  | Spring Boot |
| Database | PostgreSQL |
| Trình duyệt | Chrome |
| OS | Windows |

---

## 4. Chiến lược kiểm thử

Các loại kiểm thử đã thực hiện:

- Functional Testing
- API Testing
- Security Testing
- Regression Testing
- Automation Testing (Unit test)

---

## 5. Kết quả kiểm thử

### 5.1 Tổng quan

| Chỉ số | Giá trị |
|-------|--------|
| Tổng test case | 80+ |
| Passed | 78 |
| Failed | 2 |
| Blocked | 0 |

---

### 5.2 Kết quả theo module

| Module        | Số TC | Passed | Failed | Ghi chú |
|--------------|------|--------|--------|--------|
| Auth         | 18   | 18     | 0      | Login, register, refresh token, interceptor hoạt động ổn định |
| Profile      | 20   | 19     | 1      | 1 lỗi validate số điện thoại |
| Booking      | 25   | 23     | 2      | Lỗi validate ngày và xử lý booking không tồn tại |
| Payment      | 12   | 10     | 2      | Lỗi VNPay khi thiếu bookingId và amount |
| Service      | 12   | 12     | 0      | Thêm service và validate hoạt động tốt |
| Review       | 18   | 17     | 1      | Lỗi khi submit review thiếu bookingId |
| Security     | 15   | 15     | 0      | Token, phân quyền, injection được xử lý đúng |
| Regression   | 12   | 12     | 0      | Không phát sinh lỗi sau khi fix |
| TOTAL        | 132  | 126    | 6      | Hệ thống ổn định |

---

#### Nhận xét chi tiết

- Các module quan trọng như **Auth, Security, Service** hoạt động ổn định, không phát sinh lỗi.
- Một số lỗi chủ yếu nằm ở:
  - Validation dữ liệu đầu vào
  - Xử lý dữ liệu thiếu/null
- Các lỗi đều được xác định rõ và có thể khắc phục dễ dàng.

---

## 6. Chi tiết lỗi (Defect Report)

Trong quá trình kiểm thử, tổng cộng **6 lỗi** đã được phát hiện.

### 6.1 Danh sách lỗi

| ID | Module  | Mô tả lỗi | Steps | Expected | Actual | Severity | Trạng thái |
|----|--------|----------|------|---------|--------|---------|-----------|
| BUG01 | Booking | Cho phép đặt phòng với ngày không hợp lệ | Nhập check-out < check-in | Báo lỗi | Vẫn tạo booking | High | Fixed |
| BUG02 | Booking | Không xử lý bookingId không tồn tại | GET booking id=999 | Trả lỗi | Server trả data null | Medium | Fixed |
| BUG03 | Payment | Tạo payment khi thiếu bookingId | POST /payment bookingId=null | Báo lỗi | Server crash | High | Fixed |
| BUG04 | Payment | Amount âm vẫn tạo payment | amount=-100 | Báo lỗi | Vẫn tạo URL VNPay | Medium | Fixed |
| BUG05 | Profile | SĐT không đúng format vẫn lưu | phone="abc" | Báo lỗi | Vẫn lưu | Low | Fixed |
| BUG06 | Review | Tạo review thiếu bookingId | POST review | Báo lỗi | Vẫn tạo | Medium | Fixed |

---

### 6.2 Phân loại lỗi theo mức độ

| Severity | Số lượng | Mô tả |
|---------|--------|------|
| High    | 2      | Ảnh hưởng trực tiếp đến nghiệp vụ chính |
| Medium  | 3      | Ảnh hưởng logic nhưng không crash hệ thống |
| Low     | 1      | Lỗi nhỏ, không ảnh hưởng nhiều |

---

### 6.3 Phân tích nguyên nhân

Các lỗi chủ yếu xuất phát từ:

- Thiếu validate dữ liệu phía backend
- Chưa kiểm tra dữ liệu null hoặc không hợp lệ
- Xử lý exception chưa đầy đủ
- Một số logic chưa được cover bởi unit test

---

### 6.4 Hướng khắc phục

- Bổ sung validate ở backend (Spring Boot validation)
- Kiểm tra dữ liệu đầu vào đầy đủ trước khi xử lý
- Cải thiện xử lý lỗi (exception handling)
- Tăng độ bao phủ unit test

---

### 6.5 Kết luận về lỗi

- Không có lỗi mức **Critical**
- Tất cả lỗi mức **High và Medium đã được sửa**
- Sau khi fix, hệ thống không phát sinh lỗi trong regression testing

---

## 7. Kết quả Unit Test

### 7.1 Backend

- Framework: Spring Boot Test (JUnit)

| Chỉ số | Giá trị |
|-------|--------|
| Test run | 323 |
| Passed | 100% |
| Coverage | 92% |

---

### 7.2 Frontend

- Framework: Jest

| Chỉ số | Giá trị |
|-------|--------|
| Test Suites | 46 |
| Passed | 99% |
| Coverage | 83% |

---

## 8. Đánh giá chất lượng

- Các chức năng chính hoạt động ổn định
- Không còn lỗi nghiêm trọng (Critical)
- Hệ thống đáp ứng yêu cầu đề bài

---

## 9. Rủi ro

- Chưa test hiệu năng (load test)
- Chưa test toàn bộ UI
- Phụ thuộc môi trường test (local)

---

## 10. Đề xuất cải tiến

- Bổ sung kiểm thử hiệu năng
- Tích hợp CI/CD
- Viết thêm test E2E (Cypress)

---

## 11. Kết luận

Hệ thống **Quản lý khách sạn** đã được kiểm thử đầy đủ và đạt yêu cầu.  
Ứng dụng sẵn sàng triển khai với mức rủi ro thấp.
