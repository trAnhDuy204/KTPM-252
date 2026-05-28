
# Báo cáo đồ án
[Link Báo cáo](https://drive.google.com/file/d/1zvuqgTG4Mg5dX66rjEtGsMfKq5H35Bzf/view?usp=sharing)
# Tên dự án
## Mô tả

Dự án quản lý khách sạn: 

- Xây dựng hệ thống cho phép khách hàng tìm phòng, đặt phòng on line và thanh toán đặt cọc. Lễ tân quản lý phòng, check-in/out, cập nhật trạng thái phòng và xử lý yêu cầu d ịch vụ. Admin quản lý nhiều khách sạn, chính sách giá.

- Ðối tượng sử dụng:
+ Khách hàng (End User) : Tìm phòng, đặt phòng, thanh toán, đánh giá
+ Lễ tân/Quản lý KS (Business User) : Quản lý phòng, check-in/out,dịch vụ
+ Admin: Quản lý khách sạn, cấu hình g iá, báo cáo

## Thành viên nhóm
| MSSV | Họ tên | Vai trò |
|------|--------|---------|
| 2251012069 | Hoàng Võ Gia Huy | Tìm phòng theo ngày, loại phòng, giá (Khách hàng) |
| ... | ... | Đặt phòng, thanh toán (Khách hàng) |
| ... | ... | Quản lý đặt phòng (xem, sửa, hủy) (Khách hàng) |
| ... | ... | Viết unit test, test case từng chức năng (Khách hàng) |
| 2251010086 | Thái Đỗ Thịnh | Quản lý phòng, trạng thái phòng (lễ tân) |
| ... | ... | Check-in, check-out (lễ tân) |
| ... | ... | Xác nhận đặt phòng (lễ tân) |
| ... | ... | Viết unit test, test case từng chức năng (lễ tân) |
| 2354050011 | Vũ Nhật Lan Anh | Quản lý khách sạn (Thêm, xóa, sửa phòng) (Admin) |
| ... | ... | Quản lý tài khoản lễ tân (Admin) |
| ... | ... | Cấu hình loại phòng, giá (Admin) |
| ... | ... | Viết unit test, test case từng chức năng (Admin) |
| 2251012051 | Trần Hà Anh Duy | Đăng ký, đăng nhập |
| ... | ... | Phân quyền |
| ... | ... | Viết test plan, tổng hợp test case, test report... |
| ... | ... | Quản lý mã nguồn trên GITHUB |
| ... | ... | Thiết kế database |
| ... | ... | Đánh giá sau khi check out (Khách hàng) |
## Công nghệ sử dụng
- Backend: Spring Boot
- Frontend: ReactJS
- Database: PostgreSQL
## Cài đặt và chạy
### Yêu cầu
- Java 17+
- Node.js 18+
- PostgreSQL
### Chạy Backend
cd backend
./mvnw spring-boot:run
### Chạy môi trường test VNpay
ngrok http 8080
#### dữ liệu test:
- 9704198526191432198
- NGUYEN VAN A
- 07/15
- OTP: 123456
### Chạy Frontend
cd frontend
npm install
npm start
### Truy cập
- Frontend: http://localhost:5713
- Backend API: http://localhost:8080
## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [Test Plan](docs/test-plan.md)
- [API Documentation](docs/api-docs.md) 
