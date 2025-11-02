
# System Use Case Diagram

**Ngày cập nhật:** 3/11/2025
**Phiên bản:** 1.0

---

## 1. Sơ đồ Use Case (Flowchart)

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    %% Tác nhân (Actors) - Vẽ bên ngoài
    subgraph Clients_NguoiDung["🧑‍💻 Tác nhân (Bên ngoài)"]
        direction TB
        CUSTOMER["👤 Khách hàng"]
        STAFF["🛠️ Nhân viên (Thợ may)"]
        ADMIN["👑 Quản trị viên"]
        PaymentSvc["💳 Payment Gateway (Sepay)"]
        EmailSvc["📧 Email Service (Resend)"]
    end

    %% Ranh giới Hệ thống (System Boundary)
    subgraph System_Boundary["🏭 Hệ thống Đặt may Trực tuyến"]
        direction TB
        
        %% Các Gói (Packages) - Dùng Subgraph
        subgraph PKG_Auth["1. Quản lý Tài khoản"]
            direction TB
            UC_Login("Đăng ký / Đăng nhập")
            UC_GoogleLogin("Đăng nhập bằng Google")
            UC_Profile("Quản lý Profile & Số đo")
        end

        subgraph PKG_Product["2. Quản lý Sản phẩm"]
            direction TB
            UC_ViewProduct("Xem & Lọc Sản phẩm")
            UC_ManageProduct("Quản lý [CRUD] Sản phẩm/Vải")
        end
        
        subgraph PKG_Order["3. Nghiệp vụ Đặt hàng"]
            direction TB
            UC_CreateOrder("Tùy chỉnh & Tạo Đơn hàng")
            UC_Pay("Thanh toán Đơn hàng")
            UC_TrackOrder("Theo dõi Trạng thái Đơn hàng")
            UC_Review("Viết Đánh giá [Review]")
            UC_ManageOrder("Quản lý [CRUD] Đơn hàng")
            UC_UpdateOrder("Cập nhật Trạng thái Đơn")
        end
        
        subgraph PKG_Appt["4. Nghiệp vụ Lịch hẹn"]
            direction TB
            UC_CreateAppt("Xem Lịch trống & Đặt hẹn")
            UC_ManageAppt("Quản lý [CRUD] Lịch hẹn")
            UC_UpdateAppt("Cập nhật Trạng thái Hẹn")
        end

        subgraph PKG_Admin["5. Quản trị Hệ thống"]
            direction TB
            UC_ManageUsers("Quản lý Users [CRUD]")
            UC_Dashboard("Xem Dashboard Thống kê")
        end
        
        subgraph PKG_Notify["6. Hệ thống phụ trợ"]
            direction TB
            UC_NotifyEmail("Gửi Email Thông báo")
        end

        %% Các link "vô hình" (~~~) để ÉP layout xếp dọc
        PKG_Auth ~~~ PKG_Product
        PKG_Product ~~~ PKG_Order
        PKG_Order ~~~ PKG_Appt
        PKG_Appt ~~~ PKG_Admin
        PKG_Admin ~~~ PKG_Notify
    end
    
    %% Kết nối: Actor -> Use Case
    CUSTOMER --> UC_Login
    CUSTOMER --> UC_Profile
    CUSTOMER --> UC_ViewProduct
    CUSTOMER --> UC_CreateOrder
    CUSTOMER --> UC_TrackOrder
    CUSTOMER --> UC_Review
    CUSTOMER --> UC_CreateAppt

    STAFF --> UC_Login
    STAFF --> UC_UpdateOrder
    STAFF --> UC_UpdateAppt
    
    ADMIN --> UC_Login
    ADMIN --> UC_ManageProduct
    ADMIN --> UC_ManageOrder
    ADMIN --> UC_ManageAppt
    ADMIN --> UC_ManageUsers
    ADMIN --> UC_Dashboard

    %% Quan hệ <<extend>> (Nét đứt, có nhãn)
    UC_GoogleLogin -.->|"<<extend>>"| UC_Login

    %% Quan hệ <<include>> (Nét đứt, có nhãn)
    UC_CreateOrder -.->|"<<include>>"| UC_Pay
    UC_UpdateOrder -.->|"<<include>>"| UC_NotifyEmail
    UC_UpdateAppt -.->|"<<include>>"| UC_NotifyEmail

    %% Kết nối với Actor Hệ thống (Bên ngoài)
    UC_Pay --> PaymentSvc
    UC_NotifyEmail --> EmailSvc
    %% Webhook gọi ngược lại
    PaymentSvc -.->|Webhook| UC_UpdateOrder

    %% ===== [FIX] BẮT ĐẦU SỬA Ở ĐÂY =====
    %% Thêm color:#000 cho TẤT CẢ các style
    style Clients_NguoiDung fill:#E3F2FD,stroke:#64B5F6,stroke-width:2px,color:#000
    style CUSTOMER fill:#90CAF9,stroke:#1976D2,stroke-width:1px,color:#000
    style STAFF fill:#90CAF9,stroke:#1976D2,stroke-width:1px,color:#000
    style ADMIN fill:#90CAF9,stroke:#1976D2,stroke-width:1px,color:#000
    style PaymentSvc fill:#F48FB1,stroke:#C2185B,stroke-width:1px,color:#000
    style EmailSvc fill:#F8BBD0,stroke:#AD1457,stroke-width:1px,color:#000

    style System_Boundary fill:#F3E5F5,stroke:#BA68C8,stroke-width:2px,color:#000

    style PKG_Auth fill:#E8F5E9,stroke:#81C784,stroke-width:1.5px,color:#000
    style PKG_Product fill:#E8F5E9,stroke:#81C784,stroke-width:1.5px,color:#000
    style PKG_Order fill:#E8F5E9,stroke:#81C784,stroke-width:1.5px,color:#000
    style PKG_Appt fill:#E8F5E9,stroke:#81C784,stroke-width:1.5px,color:#000
    style PKG_Admin fill:#E8F5E9,stroke:#81C784,stroke-width:1.5px,color:#000
    style PKG_Notify fill:#E8F5E9,stroke:#81C784,stroke-width:1.5px,color:#000
    
    %% Style cho Use Cases (Hình Oval)
    style UC_Login fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_GoogleLogin fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_Profile fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_ViewProduct fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_ManageProduct fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_CreateOrder fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_Pay fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_TrackOrder fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_Review fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_ManageOrder fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_UpdateOrder fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_CreateAppt fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_ManageAppt fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_UpdateAppt fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_ManageUsers fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_Dashboard fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    style UC_NotifyEmail fill:#FFF9C4,stroke:#FBC02D,stroke-width:1px,color:#000,rx:25px,ry:25px
    linkStyle default stroke:#000,stroke-width:1.5px,color:#000
````

-----

## 2\. Mô tả Sơ đồ (Diagram Explanation)

Đây là phần giải thích chi tiết các thành phần trong Sơ đồ Use Case ở trên.

### a. Các Tác nhân (Actors)

Đây là các thực thể (người hoặc hệ thống) tương tác với hệ thống của chúng ta:

  * **👤 Khách hàng (CUSTOMER):** Người dùng cuối, thực hiện các chức năng chính (đặt hàng, đặt hẹn, xem sản phẩm).
  * **🛠️ Nhân viên (STAFF):** Người dùng nội bộ (Thợ may, Tư vấn). Vai trò bị giới hạn, chủ yếu là cập nhật trạng thái công việc (đơn hàng, lịch hẹn) do Admin gán.
  * **👑 Quản trị viên (ADMIN):** Quản lý "tối cao" (God mode), có toàn quyền CRUD (Tạo, Đọc, Sửa, Xóa) mọi tài nguyên và xem thống kê.
  * **💳 Payment Gateway (Sepay):** Actor hệ thống (bên thứ 3). Tương tác 2 chiều: hệ thống gọi nó để `Thanh toán`, và nó `Webhook` (gọi ngược) lại hệ thống để `Xác nhận` thanh toán.
  * **📧 Email Service (Resend):** Actor hệ thống (bên thứ 3). Hệ thống gọi nó để `Gửi Email Thông báo` (xác nhận đơn, đổi mật khẩu...).

### b. Ranh giới & Các Gói Nghiệp vụ

  * **🏭 Hệ thống Đặt may... (System Boundary):** Cái hộp "mẹ" màu tím. Nó đại diện cho "phạm vi" (scope) của ứng dụng mà chúng ta sẽ xây. Mọi thứ bên trong là "của mình", mọi thứ bên ngoài là "của người khác".
  * **Các hộp màu xanh (PKG\_...):** Đây là các "Gói Nghiệp vụ" (Packages). Trong kiến trúc **Modular Monolith**, mỗi gói này sẽ tương ứng với một `Module` trong code NestJS (ví dụ: `PKG_Auth` -\> `AuthModule`). Việc xếp dọc các gói này (bằng link vô hình `~~~`) thể hiện sự phân tách logic rõ ràng.
  * **Các hình Oval màu vàng (...):** Đây là một "Use Case" (Trường hợp sử dụng), đại diện cho một chức năng cụ thể mà Actor có thể thực hiện (ví dụ: "Viết Đánh giá [Review]").

### c. Các Quan hệ Quan trọng (Relationships)

  * **Mũi tên liền (`-->`):** Biểu thị một Actor *bắt đầu* (initiate) một Use Case.
  * **Mũi tên đứt (`-.->|"<<include>>"|`):** Mối quan hệ **Bắt buộc**.
      * *Ví dụ:* `UC_CreateOrder` (Tạo đơn) *bắt buộc phải bao gồm* `UC_Pay` (Thanh toán). Mày không thể tạo đơn mà không thanh toán (kể cả là COD).
  * **Mũi tên đứt (`-.->|"<<extend>>"|`):** Mối quan hệ **Mở rộng (Optional)**.
      * *Ví dụ:* `UC_GoogleLogin` (Đăng nhập Google) là một chức năng *mở rộng*, "xịn" hơn của `UC_Login` (Đăng nhập) cơ bản. Người dùng có thể Đăng nhập mà không cần dùng Google.
  * **`Webhook`:** Mũi tên đứt từ `PaymentSvc` (bên ngoài) về `UC_UpdateOrder` (bên trong), mô tả việc hệ thống bên ngoài *gọi ngược* vào hệ thống của mình để thông báo một sự kiện (ví dụ: "Khách đã trả tiền thành công").

```
