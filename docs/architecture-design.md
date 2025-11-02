# Architecture Design Document

**Ngày cập nhật:** 3/11/2025
**Phiên bản:** 1.0

---

## 1. Sơ đồ Kiến trúc Hệ thống (System Architecture Diagram)

Đây là sơ đồ ở mức cao (High-Level), mô tả các "thành phần" (Components) của toàn bộ hệ thống và cách chúng tương tác với nhau.

<img width="3167" height="1574" alt="image" src="https://github.com/user-attachments/assets/c048493e-7f12-4ca1-9ab7-4b0777eafc2f" />

---

## 2. Quyết định Kiến trúc (Architecture Decision)

### Lựa chọn: Modular Monolith (Monolith Phân module)

**Mô tả:** Hệ thống sẽ được xây dựng trên một nền tảng **Monolith** duy nhất (một codebase, một ứng dụng backend). Tuy nhiên, cấu trúc code bên trong sẽ được phân tách rõ ràng thành các **Module** độc lập về mặt logic, dựa trên các "domain nghiệp vụ" (Business Domains).

**Công nghệ lõi:** **NestJS**. NestJS sinh ra để hỗ trợ kiến trúc này một cách tự nhiên thông qua hệ thống `Module` của nó.

### Lý do lựa chọn:

1. **Tính gắn kết Nghiệp vụ (High Cohesion):** Các chức năng của dự án (Sản phẩm, Đặt hàng, Lịch hẹn, Thanh toán) có sự liên kết nghiệp vụ rất chặt chẽ. Việc tách chúng thành Microservices ở giai đoạn này là không cần thiết (overkill) và sẽ làm tăng độ phức tạp (ví dụ: quản lý giao dịch phân tán, gọi API qua mạng).
2. **Đơn giản hóa Phát triển & Triển khai (Simplicity):**

   * **Phát triển:** Cả team làm việc trên một codebase duy nhất. Việc debug và "truy vết" (trace) một luồng request (ví dụ: từ lúc người dùng nhấn "Đặt hàng" đến lúc lưu DB) trở nên cực kỳ đơn giản vì nó chỉ là các "function call" bên trong ứng dụng, không phải gọi qua mạng.
   * **Triển khai (Deployment):** Chỉ cần "build" một image (Docker) và "deploy" một container.
3. **Hiệu năng (Performance):** Không có độ trễ mạng (network latency) giữa các module, vì chúng giao tiếp trực tiếp.
4. **Toàn vẹn Giao dịch (Transactional Integrity):** Các nghiệp vụ phức tạp (ví dụ: `POST /orders`) đòi hỏi việc ghi vào nhiều bảng (Orders, OrderItems, Payments) một cách đồng thời. Trong kiến trúc Monolith, việc này được đảm bảo dễ dàng bằng `Database Transaction` (ví dụ: `Prisma Transaction`).
5. **Khả năng Bảo trì & Mở rộng (Maintainability & Scalability):**

   * Đây là lợi ích lớn nhất của "Modular". Bằng cách định nghĩa "ranh giới" rõ ràng, chúng ta ép buộc các module phải giao tiếp với nhau thông qua `Service` (Dependency Injection), chứ không được phép "biết" về CSDL hay logic nội bộ của nhau.
   * **Tương lai:** Nếu một ngày, nghiệp vụ `Appointments` (Lịch hẹn) phình to và quá tải, kiến trúc này cho phép chúng ta "bóc tách" (extract) *chỉ* `AppointmentsModule` ra thành một Microservice riêng mà không làm sập 80% hệ thống còn lại.

### Cấu trúc Module Dự kiến (NestJS)

Hệ thống sẽ được chia thành các module chính sau:

* `AppModule` (Module gốc)
* `AuthModule`: Quản lý Đăng nhập, Đăng ký, JWT, RBAC (Phân quyền).
* `UsersModule`: Quản lý Profile, Địa chỉ, và các "Bộ số đo" (Measurements) của khách.
* `ProductsModule`: Quản lý Sản phẩm (mẫu), Vải, Kiểu dáng, Giá.
* `OrdersModule`: Module nghiệp vụ "nặng" nhất. Xử lý Giỏ hàng, Tạo đơn, Cập nhật trạng thái (State Machine).
* `AppointmentsModule`: Xử lý nghiệp vụ Lịch hẹn, Check slot trống, Quản lý lịch.
* `PaymentsModule`: Tích hợp Stripe/Sepay, xử lý Webhook thanh toán.
* `NotificationsModule`: Quản lý việc gửi Email/SMS (tách riêng để các module khác gọi đến).
* `AdminModule`: Tổng hợp các API dành riêng cho Admin (Dashboard, quản lý...).

---

## 3. Mô tả Các thành phần (Component Description)

### 1. Clients (Người dùng)

* **Khách hàng (ReactJS App):** Giao diện web chính cho khách hàng. Tương tác với hệ thống qua API (HTTPS).
* **Quản trị viên (React Admin App):** Trang quản trị nội bộ cho `Admin` và `Staff`. Tương tác với hệ thống qua API (có bảo mật và phân quyền).

### 2. Hệ thống Tiệm may (Our System)

* **API Gateway/Firewall:** Lớp "cổng" đầu vào (ví dụ: Nginx, Cloudflare). Chịu trách nhiệm về SSL, Rate Limiting (chống spam), và điều hướng request tới Backend.
* **Backend (NestJS Modular Monolith):** "Bộ não" của hệ thống. Đây là nơi chứa toàn bộ logic nghiệp vụ (Auth, Orders, Products...), xử lý các request, và tương tác với các kho dữ liệu.
* **PostgreSQL DB (Database):** Nguồn dữ liệu "chính thống" (Single Source of Truth). Lưu trữ toàn bộ dữ liệu có cấu trúc và cần tính toàn vẹn cao (Users, Orders, Products, Appointments...).
* **Redis (Cache):** Kho dữ liệu "nóng" (hot storage).

  * **Mục đích 1 (Cache):** Lưu cache các dữ liệu ít thay đổi nhưng đọc nhiều (ví dụ: danh sách sản phẩm, các loại vải).
  * **Mục đích 2 (Booking Locks):** **Rất quan trọng!** Dùng để "khóa" các slot lịch hẹn. Khi người A chọn 10:00, hệ thống sẽ "lock" slot này 5 phút trong Redis, ngăn người B chọn trùng (tránh Concurrency Issues) trước khi người A kịp "ghi" vào PostgreSQL.
* **AWS S3 (File Storage):** Dịch vụ lưu trữ đối tượng. Dùng để lưu trữ các file "tĩnh" nặng (hình ảnh sản phẩm, ảnh mẫu vải...). Backend sẽ chỉ lưu URL của ảnh trong PostgreSQL. Client sẽ tải ảnh trực tiếp từ S3 (để giảm tải cho Backend).

### 3. Dịch vụ Bên ngoài (External)

* **Payment Gateway (Sepay):** Dịch vụ xử lý thanh toán. Backend sẽ gọi API của họ để tạo phiên thanh toán. Họ sẽ gọi lại hệ thống của ta (qua `Webhook`) để thông báo thanh toán thành công.
* **Email Service (Resend):** Dịch vụ gửi email. Dùng để gửi các thông báo tự động (xác nhận đơn hàng, xác nhận lịch hẹn...).

