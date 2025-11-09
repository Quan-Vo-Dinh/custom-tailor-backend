
# Database Design Document (ERD)

**Ngày cập nhật:** 3/11/2025

**Phiên bản:** 1.1

---

## 1. Sơ đồ Quan hệ Thực thể (ERD)

Sơ đồ này mô tả các thực thể (bảng) và mối quan hệ (khóa ngoại) giữa chúng.

```mermaid
erDiagram
    %% ==================================
    %% 1. Domain: User & Auth
    %% ==================================
    User {
        String id PK "UUID (e.g., CUID)"
        String email UK "Email (unique)"
        String passwordHash
        Role role "Enum (CUSTOMER, ADMIN, STAFF)"
        String provider "Enum (EMAIL, GOOGLE)"
        String providerId "Dùng cho Google OAuth"
        DateTime createdAt
        DateTime updatedAt
    }

    Profile {
        String id PK "UUID"
        String userId FK "1-1 với User"
        String fullName
        String phone
        String avatarUrl
    }

    Address {
        String id PK "UUID"
        String userId FK "N-1 với User"
        String street
        String city
        String country
        Boolean isDefault
    }

    Measurement {
        String id PK "UUID"
        String userId FK "N-1 với User"
        String name "Tên bộ (e.g., 'Số đo Vest', 'Số đo Sơ mi')"
        Json details "JSON (e.g., { 'vai': 40, 'nguc': 90... })"
    }

    %% ==================================
    %% 2. Domain: Product & Customization
    %% ==================================
    Category {
        String id PK "UUID"
        String name UK
        String slug UK
    }

    Product {
        String id PK "UUID"
        String categoryId FK "N-1 với Category"
        String name
        String description
        Decimal basePrice "Giá gốc (chưa tùy chọn)"
        Json images "Mảng các URL ảnh"
        Boolean isPublished
    }

    Fabric {
        String id PK "UUID"
        String name UK "Tên vải (e.g., 'Lụa Tơ Tằm')"
        String imageUrl
        Decimal priceAdjustment "Giá chênh lệch (cộng/trừ)"
    }

    StyleOption {
        String id PK "UUID"
        String name "Tên kiểu (e.g., 'Cổ Đức', 'Cổ Tàu')"
        String type "Loại tùy chọn (e.g., 'Cổ áo', 'Kiểu tay')"
        Decimal priceAdjustment "Giá chênh lệch"
    }

    %% Bảng M2M (Nối Product với Tùy chọn)
    Product_Fabrics {
        String productId FK "N-M với Product"
        String fabricId FK "N-M với Fabric"
    }
    
    Product_StyleOptions {
        String productId FK "N-M với Product"
        String styleOptionId FK "N-M với StyleOption"
    }

    %% ==================================
    %% 3. Domain: Order & Payment
    %% ==================================
    Order {
        String id PK "UUID"
        String userId FK "N-1 với User"
        String staffId FK "N-1 với User (optional, gán cho thợ may)"
        OrderStatus status "Enum (PENDING, CONFIRMED, IN_PRODUCTION...)"
        Decimal totalAmount "Tổng tiền cuối cùng"
        String shippingAddress "Snapshot (JSON) địa chỉ lúc đặt"
        DateTime createdAt
    }

    OrderItem {
        String id PK "UUID"
        String orderId FK "N-1 với Order"
        String productId FK "N-1 với Product"
        String fabricId FK "N-1 với Fabric"
        String styleOptionId FK "N-1 với StyleOption (nullable)"
        Int quantity
        Decimal priceAtTime "Snapshot (giá * sl) tại thời điểm đặt"
        Json measurementSnapshot "Snapshot (JSON) bộ số đo lúc đặt"
    }

    Payment {
        String id PK "UUID"
        String orderId FK "1-1 với Order"
        PaymentMethod method "Enum (COD, SEPAY)"
        PaymentStatus status "Enum (PENDING, SUCCESS, FAILED)"
        String transactionId "Mã giao dịch từ Sepay"
        DateTime updatedAt
    }

    Review {
        String id PK "UUID"
        String userId FK "N-1 với User"
        String productId FK "N-1 với Product"
        String orderId FK "1-1 với Order (để check 'đã mua')"
        Int rating "1-5 sao"
        String comment
    }

    %% ==================================
    %% 4. Domain: Booking / Appointment
    %% ==================================
    Appointment {
        String id PK "UUID"
        String userId FK "N-1 với User"
        String staffId FK "N-1 với User (optional, gán cho nhân viên)"
        AppointmentStatus status "Enum (PENDING, CONFIRMED, CANCELLED)"
        DateTime startTime
        DateTime endTime
        String notes "Ghi chú của khách"
    }


    %% ==================================
    %% 5. Định nghĩa Quan hệ (Relationships)
    %% ==================================
    User ||--o| Profile : "1-1"
    User ||--|{ Address : "1-N"
    User ||--|{ Measurement : "1-N"
    User ||--|{ Order : "1-N (Khách đặt)"
    User ||--|{ Appointment : "1-N (Khách đặt)"
    User ||--|{ Review : "1-N"
    User |o--o{ Order : "1-N (Staff xử lý)"
    User |o--o{ Appointment : "1-N (Staff xử lý)"

    Category ||--|{ Product : "1-N"
    
    Product ||--|{ OrderItem : "1-N"
    Product ||--|{ Review : "1-N"
    Product }o--o{ Fabric : "N-M (qua Product_Fabrics)"
    Product }o--o{ StyleOption : "N-M (qua Product_StyleOptions)"

    Fabric ||--|{ OrderItem : "1-N"
    StyleOption ||--|{ OrderItem : "1-N"

    Order ||--|{ OrderItem : "1-N"
    Order ||--o| Payment : "1-1"
    Order |o--o| Review : "1-1 (optional)"
````

-----



## 2\. Database dự kiến:

**Link dbml:**
* **https://dbdocs.io/vodinhquan2707.it/custom-tailor**
* **https://dbdiagram.io/d/custom-tailor-691050826735e11170e7e52d**


<img width="1427" height="1168" alt="Untitled" src="https://github.com/user-attachments/assets/8ca2e810-312a-477f-af3f-3c5d7acc5cdf" />

## 3\. Giải thích các Bảng & Quyết định Thiết kế

### 1. Domain: Quản lý Người dùng & Xác thực

Nhóm thực thể này chịu trách nhiệm lưu trữ thông tin định danh, xác thực, phân quyền và các dữ liệu cá nhân liên quan đến người dùng.

#### 1.1. Bảng `User`
* **Mục đích:** Đây là bảng lõi, lưu trữ thông tin "xác thực" (authentication) và "phân quyền" (authorization) cơ bản nhất của một tài khoản.
* **Giải thích các cột chính:**
    * `id` (PK): Khóa chính, định danh duy nhất cho mỗi người dùng.
    * `email` (UK): Email đăng nhập, bắt buộc là duy nhất (Unique Key).
    * `passwordHash`: Chỉ lưu trữ mật khẩu đã được "băm" (hashed), không bao giờ lưu mật khẩu gốc (plain text).
    * `role` (Enum): Cột cho việc Phân quyền (RBAC). Giá trị có thể là `CUSTOMER`, `ADMIN`, `STAFF`.
    * `provider`: Xác định tài khoản này được tạo qua kênh nào (ví dụ: `EMAIL` hoặc `GOOGLE`) để xử lý logic đăng nhập OAuth.

#### 1.2. Bảng `Profile`
* **Mục đích:** Lưu trữ các thông tin "cá nhân" (personal) của người dùng. Bảng này được tách ra khỏi `User` (quan hệ 1-1) để tối ưu hiệu suất và bảo mật; logic xác thực không cần phải tải thông tin cá nhân.
* **Giải thích các cột chính:**
    * `userId` (FK): Khóa ngoại, liên kết 1-1 chặt chẽ với bảng `User`.
    * `fullName`, `phone`, `avatarUrl`: Các thông tin hiển thị trên giao diện.

#### 1.3. Bảng `Address`
* **Mục đích:** Cho phép một người dùng lưu trữ nhiều địa chỉ giao hàng (quan hệ 1-N).
* **Giải thích các cột chính:**
    * `userId` (FK): Khóa ngoại, cho biết địa chỉ này thuộc về người dùng nào.
    * `isDefault` (Boolean): Một cờ (flag) để xác định đâu là địa chỉ mặc định sẽ được ưu tiên hiển thị khi thanh toán.

#### 1.4. Bảng `Measurement`
* **Mục đích:** Lưu trữ nhiều "bộ số đo" khác nhau cho từng người dùng (ví dụ: "Số đo mặc Vest", "Số đo Sơ mi T10/2025").
* **Giải thích các cột chính:**
    * `userId` (FK): Cho biết bộ số đo này của ai (quan hệ 1-N).
    * `name`: Tên định danh cho bộ số đo (do người dùng tự đặt).
    * `details` (JSON): Cột "ăn tiền". Sử dụng kiểu dữ liệu JSON (PostgreSQL hỗ trợ) để lưu trữ linh hoạt các chỉ số đo (ví dụ: `{ "vai": 40, "nguc": 90, "eo": 70, "dai_tay": 60 }`). Việc dùng JSON giúp dễ dàng thêm/bớt chỉ số trong tương lai mà không cần sửa cấu trúc (migrate) database.

---

### 2. Domain: Quản lý Sản phẩm & Tùy chỉnh

Nhóm thực thể này định nghĩa "danh mục" (catalog) sản phẩm. Do đặc thù "may đo", các sản phẩm là các "khuôn mẫu" (template) và các tùy chọn (vải, kiểu) được tách riêng.

#### 2.1. Bảng `Category`
* **Mục đích:** Phân loại sản phẩm (ví dụ: "Áo Vest", "Áo Sơ Mi", "Quần Tây").

#### 2.2. Bảng `Product`
* **Mục đích:** Lưu trữ thông tin về một "mẫu" (template) sản phẩm, không phải một sản phẩm cụ thể.
* **Giải thích các cột chính:**
    * `basePrice` (Decimal): Giá "cơ sở" hay "giá gốc" của mẫu này *trước khi* người dùng chọn các tùy chọn (vải, kiểu...).

#### 2.3. Bảng `Fabric` và `StyleOption`
* **Mục đích:** Các bảng "master data" (dữ liệu gốc) cho các tùy chọn.
    * `Fabric`: Lưu danh sách các loại vải (Lụa, Kaki...).
    * `StyleOption`: Lưu các kiểu dáng (Cổ Đức, Cổ Tàu, Tay măng-séc...).
* **Giải thích các cột chính:**
    * `priceAdjustment` (Decimal): Giá "điều chỉnh" (chênh lệch). Số tiền này sẽ được *cộng hoặc trừ* vào `basePrice` của `Product` để tính ra giá cuối cùng.
    * `type` (trong `StyleOption`): Dùng để nhóm các tùy chọn (ví dụ: "Kiểu cổ", "Kiểu tay áo").

#### 2.4. Bảng `Product_Fabrics` và `Product_StyleOptions`
* **Mục đích:** Đây là 2 "bảng nối" (junction table) thực thi quan hệ Nhiều-Nhiều (N-M).
* **Logic nghiệp vụ:** Chúng định nghĩa "luật chơi". Ví dụ, "Áo Vest A" (Product) chỉ được phép dùng "Vải Lụa, Kaki" (Fabrics), chứ không được dùng "Vải Voan". Quản trị viên sẽ cấu hình các liên kết này trong trang Admin.

---

### 3. Domain: Quản lý Đơn hàng & Thanh toán

Nhóm thực thể Bussiness Logic chính, lưu trữ toàn bộ lịch sử giao dịch và các thông tin "bất biến" (immutable) tại thời điểm đặt hàng.

#### 3.1. Bảng `Order`
* **Mục đích:** Lưu thông tin "chung" (header) của một đơn hàng.
* **Giải thích các cột chính:**
    * `userId` (FK): Khách hàng đã đặt đơn này.
    * `staffId` (FK, nullable): Nhân viên/thợ may được gán để thực hiện đơn này (có thể trống ban đầu).
    * `status` (Enum): Cột "trạng thái" (State Machine), ví dụ: `PENDING`, `CONFIRMED`, `IN_PRODUCTION`, `SHIPPING`, `COMPLETED`, `CANCELLED`.
    * `shippingAddress` (JSON): **Snapshot (Bản chụp).** Lưu trữ bản sao (copy) của địa chỉ dưới dạng JSON tại thời điểm đặt hàng. Điều này đảm bảo đơn hàng giữ đúng địa chỉ, ngay cả khi sau này người dùng cập nhật/xóa địa chỉ gốc trong bảng `Address`.
    * `totalAmount`: Tổng tiền cuối cùng (đã tính toán).

#### 3.2. Bảng `OrderItem`
* **Mục đích:** **Bảng quan trọng nhất trong hệ thống.** Lưu chi tiết từng sản phẩm trong một đơn hàng, cùng với *tất cả* tùy chọn và số đo đã được "chốt".
* **Giải thích các cột chính:**
    * `orderId` (FK): Liên kết đến đơn hàng "mẹ".
    * `productId`, `fabricId`, `styleOptionId` (FKs): Các khóa ngoại "chốt" xem khách hàng đã chọn mẫu nào, vải nào, kiểu nào.
    * `priceAtTime` (Decimal): **Snapshot (Bản chụp) Giá.** Lưu giá *cuối cùng* của item này (đã tính `basePrice` + `priceAdjustment`...) tại thời điểm đặt. Đảm bảo giá không bị thay đổi nếu Admin cập nhật giá gốc trong tương lai.
    * `measurementSnapshot` (JSON): **Snapshot (Bản chụp) Số đo.** Lưu một bản sao (copy) của bộ số đo (từ bảng `Measurement` hoặc do khách nhập tay) dưới dạng JSON. Đảm bảo thợ may luôn có đúng số đo, ngay cả khi khách sửa/xóa số đo gốc trong profile.

#### 3.3. Bảng `Payment`
* **Mục đích:** Lưu trữ thông tin thanh toán, liên kết 1-1 với `Order`.
* **Giải thích các cột chính:**
    * `orderId` (FK, UK): Khóa ngoại (đồng thời là Unique Key) đảm bảo một đơn hàng chỉ có một giao dịch thanh toán.
    * `method` (Enum): Phương thức thanh toán (`COD`, `SEPAY`...).
    * `status` (Enum): Trạng thái thanh toán (`PENDING`, `SUCCESS`, `FAILED`).
    * `transactionId`: Mã giao dịch do cổng thanh toán (Sepay) trả về.

#### 3.4. Bảng `Review`
* **Mục đích:** Cho phép người dùng đánh giá sản phẩm họ đã mua.
* **Giải thích các cột chính:**
    * `orderId` (FK): Cột quan trọng để xác thực. Hệ thống có thể kiểm tra xem `userId` này có thực sự đã mua (`status: COMPLETED`) sản phẩm (`productId`) này thông qua `orderId` hay không, trước khi cho phép viết review.

---

### 4. Domain: Quản lý Lịch hẹn (Booking)

#### 4.1. Bảng `Appointment`
* **Mục đích:** Lưu trữ thông tin các lịch hẹn (đến tiệm đo, tư vấn).
* **Giải thích các cột chính:**
    * `userId` (FK): Khách hàng đặt lịch.
    * `staffId` (FK, nullable): Nhân viên được gán để tiếp khách (nếu có).
    * `status` (Enum): Trạng thái lịch hẹn (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
    * `startTime`, `endTime`: Thời gian bắt đầu và kết thúc của slot hẹn.
