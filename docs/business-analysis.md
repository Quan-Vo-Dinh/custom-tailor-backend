# Business Analysis Document

**Ngày cập nhật:** 2/11/2025
**Phiên bản:** 1.0

---

## 1. Phân tích Nghiệp vụ (Business Details)

Tài liệu này mô tả các yêu cầu và logic nghiệp vụ cơ bản của hệ thống.

### 1.1. Phân tích Tác nhân (Actors)

Hệ thống xác định ba (3) tác nhân chính với các vai trò và quyền hạn riêng biệt:

1.  **CUSTOMER (Khách hàng):**
    - **Mô tả:** Người dùng cuối cùng, truy cập hệ thống để đặt may hoặc đặt lịch hẹn.
    - **Mục tiêu:** Sở hữu trang phục tùy chỉnh, theo dõi được quá trình thực hiện.
    - **Quyền hạn:** Quản lý (CRUD) các thông tin cá nhân của riêng mình (profile, số đo, địa chỉ). Xem và theo dõi các đơn hàng, lịch hẹn của riêng mình.

2.  **ADMIN (Quản trị viên / Chủ tiệm):**
    - **Mô tả:** Người sở hữu và quản lý toàn bộ hệ thống.
    - **Mục tiêu:** Quản lý hoạt động kinh doanh, theo dõi doanh thu và vận hành.
    - **Quyền hạn:** Toàn quyền (Super Admin) trên hệ thống. CRUD (Tạo, Đọc, Sửa, Xóa) tất cả tài nguyên (Sản phẩm, Đơn hàng, Lịch hẹn, Khách hàng, Nhân viên).

3.  **STAFF (Nhân viên / Thợ may):**
    - **Mô tả:** Người thực thi các nghiệp vụ chính (tư vấn, may đo).
    - **Mục tiêu:** Hoàn thành các công việc được Quản trị viên (Admin) giao phó.
    - **Quyền hạn:** Quyền hạn bị giới hạn. Chủ yếu là `READ` (Đọc) và `UPDATE` (Cập nhật) trạng thái cho các đơn hàng hoặc lịch hẹn _đã được gán_ cho mình. Không có quyền tạo/xóa các tài nguyên quan trọng (như Sản phẩm, Vải...).

### 1.2. Phân tích Luồng nghiệp vụ (Business Flows as User Stories)

Các luồng nghiệp vụ chính được mô tả dưới dạng User Stories (Câu chuyện người dùng):

**Luồng 1: Đặt may Online (E-commerce Flow)**

- `Story 1 (Duyệt):` "Là một `Customer`, tôi muốn `tìm kiếm và lọc` sản phẩm (theo loại, giá...) để `tìm mẫu tôi thích`."
- `Story 2 (Tùy chỉnh):` "Là một `Customer`, khi xem chi tiết 1 mẫu, tôi muốn `chọn được Vải` và `chọn được Kiểu dáng` (cổ, tay...) để `hệ thống tính toán giá`."
- `Story 3 (Số đo):` "Là một `Customer`, tôi muốn `chọn 1 bộ số đo` đã lưu trong profile, HOẶC `tự nhập số đo mới` cho đơn hàng này."
- `Story 4 (Đặt hàng):` "Là một `Customer`, tôi muốn `thanh toán` qua Stripe/Sepay hoặc COD và `nhận xác nhận` đơn hàng."
- `Story 5 (Quản lý):` "Là một `Admin`, khi có đơn hàng mới, tôi muốn `xác nhận đơn` và `gán (assign) nó cho một Staff` cụ thể."
- `Story 6 (Sản xuất):` "Là một `Staff`, tôi muốn `xem các đơn hàng được gán cho tôi` và `cập nhật trạng thái` của nó (ví dụ: 'Đang may')."

**Luồng 2: Đặt lịch hẹn (Booking Flow)**

- `Story 1 (Check lịch):` "Là một `Customer`, tôi muốn `xem các slot giờ còn trống` của tiệm (theo ngày) để `tìm giờ phù hợp`."
- `Story 2 (Đặt):` "Là một `Customer`, tôi muốn `chọn 1 slot` và `nhận xác nhận` lịch hẹn qua email."
- `Story 3 (Quản lý):` "Là một `Admin`, tôi muốn `xem tất cả lịch hẹn` trong ngày và `biết lịch hẹn đó do Staff nào` phụ trách."

### 1.3. Phân tích Máy trạng thái (State Machines)

Định nghĩa các trạng thái và sự kiện chuyển đổi cho các thực thể quan trọng:

1.  **State Machine cho `Order` (Đơn hàng):**
    - `Pending`: Chờ thanh toán (mới tạo, hoặc thanh toán thất bại).
    - `Confirmed`: Đã xác nhận (Event: Thanh toán thành công / Admin duyệt COD).
    - `In_Production`: Đang gia công/may (Event: Admin/Staff bắt đầu xử lý).
    - `Ready_for_Pickup` / `Shipping`: Sẵn sàng / Đang giao (Event: Staff hoàn thành).
    - `Completed`: Hoàn tất (Event: Khách đã nhận hàng).
    - `Cancelled`: Đã hủy (Event: Khách/Admin hủy).
    - _Quy tắc nghiệp vụ:_ Không thể hủy đơn khi đã ở trạng thái `Shipping` hoặc `Completed`.

2.  **State Machine cho `Appointment` (Lịch hẹn):**
    - `Pending`: Chờ xác nhận (khách vừa đặt).
    - `Confirmed`: Đã xác nhận (Event: Admin duyệt).
    - `Completed`: Đã hoàn tất (Event: Khách đã đến tư vấn xong).
    - `Cancelled`: Đã hủy (Event: Khách/Admin hủy).
    - `No_Show`: Khách không đến (Event: Tự động chuyển nếu qua giờ hẹn).

---

## 2. Yêu cầu Chức năng (Functional Requirements - FRs)

Danh sách các chức năng bắt buộc hệ thống phải đáp ứng.

### FR-AUTH (Xác thực & Phân quyền)

- Hệ thống **phải** cung cấp chức năng Đăng ký (Email/Password), Đăng nhập.
- Hệ thống **phải** hỗ trợ Đăng nhập bằng Google.
- Hệ thống **phải** có chức năng "Quên mật khẩu" (gửi link qua email).
- Hệ thống **phải** bảo vệ API bằng JWT (Access Token & Refresh Token).
- Hệ thống **phải** phân quyền dựa trên vai trò (Role-Based Access Control - RBAC) cho `CUSTOMER`, `ADMIN`, `STAFF`.

### FR-CUSTOMER (Quản lý Người dùng)

- Người dùng **phải** xem và sửa được thông tin profile cá nhân.
- Người dùng **phải** có khả năng `THÊM`, `SỬA`, `XÓA` các "bộ số đo" (ví dụ: "Số đo vest", "Số đo sơ mi") trong tài khoản của mình.
- Người dùng **phải** xem được lịch sử toàn bộ đơn hàng và lịch hẹn đã đặt.

### FR-PRODUCTS (Quản lý Sản phẩm)

- Hệ thống **phải** hiển thị danh sách sản phẩm (mẫu quần áo) có phân trang.
- Hệ thống **phải** cho phép `LỌC` sản phẩm (theo loại) và `TÌM KIẾM` (theo tên).
- Khi xem chi tiết, hệ thống **phải** hiển thị các "tùy chọn" đi kèm:
  - Danh sách `Vải` (kèm hình ảnh, giá chênh lệch).
  - Danh sách `Kiểu dáng` (ví dụ: kiểu cổ, kiểu tay).

### FR-ORDER (Quản lý Đặt hàng)

- Hệ thống **phải** cho phép thêm sản phẩm (đã tùy chỉnh Vải, Kiểu) vào giỏ hàng.
- Khi tiến hành đặt hàng, hệ thống **phải** cho phép người dùng:
  1.  Chọn một "bộ số đo" đã lưu.
  2.  HOẶC nhập một "bộ số đo" mới tại chỗ.
- Hệ thống **phải** tính toán tổng giá tiền cuối cùng.
- Hệ thống **phải** hỗ trợ ít nhất 2 hình thức thanh toán: `COD` và Tích hợp cổng thanh toán (`Stripe`/`Sepay`).
- Hệ thống **phải** cho phép người dùng theo dõi trạng thái đơn hàng (theo State Machine 1.3).
- Hệ thống **phải** cho phép người dùng `ĐÁNH GIÁ` (rate 1-5 sao, viết review) cho đơn hàng đã `Completed`.

### FR-BOOKING (Quản lý Lịch hẹn)

- Hệ thống **phải** hiển thị một giao diện lịch (Calendar) cho phép xem các "slot" giờ còn trống theo ngày.
- Hệ thống **phải** cho phép người dùng chọn 1 slot trống để đặt lịch.
- Hệ thống **phải** ngăn chặn việc đặt trùng lịch (double-booking) cho cùng một thời điểm.

### FR-ADMIN/STAFF (Quản trị Vận hành)

- `Admin` **phải** có khả năng `CRUD` (Tạo, Đọc, Sửa, Xóa) mọi tài nguyên (Products, Fabrics, Styles, Users, Appointments, Orders).
- `Admin` **phải** có khả năng `XEM` và `XÁC NHẬN` đơn hàng mới.
- `Admin` **phải** có khả năng `GÁN (Assign)` một đơn hàng hoặc một lịch hẹn cho một `Staff` cụ thể.
- `Staff` **phải** có khả năng `XEM` danh sách công việc (đơn hàng, lịch hẹn) _chỉ được gán cho mình_.
- `Staff` **phải** có khả năng `CẬP NHẬT` trạng thái công việc (ví dụ: chuyển đơn hàng sang `In_Production`).
- `Admin` **phải** xem được Bảng điều khiển (Dashboard) thống kê cơ bản.

### FR-NOTIFICATION (Thông báo)

- Hệ thống **phải** tự động gửi email cho khách hàng khi trạng thái `Order` hoặc `Appointment` có cập nhật quan trọng (Confirmed, Cancelled, Shipping).

---

## 3. Yêu cầu Phi Chức năng (Non-Functional Requirements - NFRs)

Các tiêu chuẩn về chất lượng, hiệu suất và bảo mật của hệ thống.

### NFR-Performance (Hiệu năng)

- Thời gian phản hồi (response time) của các API chính (GET) **phải** dưới 500ms ở điều kiện tải trung bình.
- Trang danh sách sản phẩm (có nhiều hình ảnh) **phải** tải đầy đủ (full load) dưới 3 giây.
- API kiểm tra lịch trống (`GET /appointments/slots`) **phải** phản hồi dưới 300ms (yêu cầu sử dụng Caching như Redis).

### NFR-Security (Bảo mật)

- Mật khẩu người dùng **phải** được `hash` (sử dụng `bcrypt` hoặc thuật toán tương đương).
- Hệ thống **phải** ngăn chặn các tấn công cơ bản (SQL Injection, XSS) bằng cách `validate` (xác thực) mọi dữ liệu đầu vào (Input DTOs) và sử dụng `PrismaORM` (chống SQL Injection).
- Hệ thống **phải** đảm bảo logic Phân quyền (Authorization) chặt chẽ:
  - Người dùng A không thể xem/sửa tài nguyên của người dùng B.
  - Vai trò `STAFF` không thể truy cập API của `ADMIN`.

### NFR-Reliability (Độ tin cậy)

- Hệ thống **phải** đảm bảo **Transactional Integrity (Toàn vẹn Giao dịch)**.
  - _Ví dụ:_ Khi tạo đơn hàng, việc ghi vào bảng `Order`, `OrderItem`, và `Payment` phải nằm trong một `Transaction`. Nếu một bước thất bại, toàn bộ phải được `Rollback`. (Sử dụng `Prisma Transaction`).
- Uptime (Thời gian hoạt động) của hệ thống mục tiêu là 99.9%.

### NFR-Scalability (Khả năng mở rộng)

- Kiến trúc backend (NestJS) **phải** được xây dựng theo dạng **Modular Monolith**.
- Các nghiệp vụ chính (Auth, Products, Orders, Appointments) phải được tách thành các `Module` riêng biệt, giao tiếp nội bộ qua `Service`.
- _Lý do:_ Thiết kế này cho phép hệ thống dễ dàng bảo trì và có khả năng "bóc tách" một module (ví dụ: `Appointments`) ra thành Microservice riêng trong tương lai nếu cần mở rộng.

### NFR-Maintainability (Khả năng bảo trì)

- Code **phải** tuân thủ theo "style guide" chuẩn.
- Hệ thống **phải** có **Logging** (ghi log) chi tiết, đặc biệt là các lỗi API (500) và các hành động nghiệp vụ quan trọng (tạo đơn hàng, thanh toán).
- API **phải** được tự động tài liệu hóa (document) bằng `NestJS Swagger` dựa trên DTOs và Decorators.
