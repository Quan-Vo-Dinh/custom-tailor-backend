# 📚 Custom Tailor Backend - API Documentation

Tài liệu chi tiết toàn bộ API endpoints cho frontend integration.

**Base URL**: `http://localhost:3001`  
**API Documentation (Swagger)**: `http://localhost:3001/api/docs`

---

## 📑 Table of Contents

- [Authentication](#authentication)
- [Users Management](#users-management)
- [Products Management](#products-management)
- [Orders Management](#orders-management)
- [Appointments Management](#appointments-management)
- [Admin Dashboard](#admin-dashboard)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

### Overview

- Authentication sử dụng **JWT (JSON Web Tokens)**
- Access token có thời hạn 7 ngày (có thể thay đổi trong `.env`)
- Sau khi đăng nhập thành công, lưu `accessToken` và `refreshToken`
- Gửi token trong header: `Authorization: Bearer <accessToken>`

### Base Path: `/auth`

---

### 1. Sign Up (Đăng ký)

**Endpoint**: `POST /auth/sign-up`  
**Auth Required**: ❌ No  
**Description**: Đăng ký tài khoản mới

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cm3h8...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0901234567",
      "role": "CUSTOMER",
      "createdAt": "2025-11-23T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation**:

- `email`: phải là email hợp lệ, unique
- `password`: tối thiểu 6 ký tự
- `fullName`: bắt buộc
- `phoneNumber`: bắt buộc

---

### 2. Sign In (Đăng nhập)

**Endpoint**: `POST /auth/sign-in`  
**Auth Required**: ❌ No  
**Description**: Đăng nhập vào hệ thống

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": "cm3h8...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### 3. Refresh Token

**Endpoint**: `POST /auth/refresh`  
**Auth Required**: ❌ No  
**Description**: Làm mới access token khi hết hạn

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Current User

**Endpoint**: `POST /auth/me`  
**Auth Required**: ✅ Yes (Bearer Token)  
**Description**: Lấy thông tin user hiện tại

**Headers**:

```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": "cm3h8...",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "role": "CUSTOMER",
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

---

## 👤 Users Management

### Base Path: `/users`

---

### 1. Get User Profile

**Endpoint**: `GET /users/profile`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER, STAFF, ADMIN  
**Description**: Lấy thông tin profile của user hiện tại

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": "cm3h8...",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "role": "CUSTOMER",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

---

### 2. Update User Profile

**Endpoint**: `PUT /users/profile`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER, STAFF, ADMIN  
**Description**: Cập nhật thông tin profile

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "cm3h8...",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0987654321",
    "role": "CUSTOMER"
  }
}
```

---

### 3. Get User Addresses

**Endpoint**: `GET /users/addresses`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy danh sách địa chỉ giao hàng của user

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "addr_1",
      "recipientName": "Nguyễn Văn A",
      "phoneNumber": "0901234567",
      "addressLine": "123 Đường ABC",
      "ward": "Phường 1",
      "district": "Quận 1",
      "city": "TP.HCM",
      "isDefault": true,
      "createdAt": "2025-11-23T10:00:00.000Z"
    }
  ]
}
```

---

### 4. Create Address

**Endpoint**: `POST /users/addresses`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Tạo địa chỉ giao hàng mới

**Request Body**:

```json
{
  "recipientName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "addressLine": "123 Đường ABC",
  "ward": "Phường 1",
  "district": "Quận 1",
  "city": "TP.HCM",
  "isDefault": false
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "message": "Address created successfully",
  "data": {
    "id": "addr_2",
    "recipientName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "addressLine": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP.HCM",
    "isDefault": false
  }
}
```

---

### 5. Update Address

**Endpoint**: `PUT /users/addresses/:addressId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Cập nhật địa chỉ

**Request Body**:

```json
{
  "recipientName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "addressLine": "456 Đường XYZ"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Address updated successfully",
  "data": {
    "id": "addr_2",
    "recipientName": "Nguyễn Văn B",
    "phoneNumber": "0987654321",
    "addressLine": "456 Đường XYZ",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP.HCM"
  }
}
```

---

### 6. Delete Address

**Endpoint**: `DELETE /users/addresses/:addressId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Xóa địa chỉ

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Address deleted successfully"
}
```

---

### 7. Set Default Address

**Endpoint**: `PUT /users/addresses/:addressId/set-default`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Đặt địa chỉ làm mặc định

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Default address updated successfully",
  "data": {
    "id": "addr_2",
    "isDefault": true
  }
}
```

---

### 8. Get User Measurements

**Endpoint**: `GET /users/measurements`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy thông tin số đo cơ thể

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "meas_1",
      "name": "Số đo mặc định",
      "chest": 95.5,
      "waist": 82.0,
      "hips": 98.0,
      "shoulder": 45.0,
      "sleeveLength": 62.0,
      "shirtLength": 75.0,
      "neck": 38.0,
      "inseam": 80.0,
      "outseam": 105.0,
      "thigh": 56.0,
      "notes": "Đo vào ngày 23/11/2025",
      "createdAt": "2025-11-23T10:00:00.000Z"
    }
  ]
}
```

---

### 9. Create/Update Measurements

**Endpoint**: `POST /users/measurements`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Tạo hoặc cập nhật số đo

**Request Body**:

```json
{
  "name": "Số đo mùa đông",
  "chest": 96.0,
  "waist": 83.0,
  "hips": 99.0,
  "shoulder": 46.0,
  "sleeveLength": 63.0,
  "shirtLength": 76.0,
  "neck": 39.0,
  "inseam": 81.0,
  "outseam": 106.0,
  "thigh": 57.0,
  "notes": "Tăng 1kg so với mùa hè"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "message": "Measurements created successfully",
  "data": {
    "id": "meas_2",
    "name": "Số đo mùa đông",
    "chest": 96.0,
    "waist": 83.0,
    "notes": "Tăng 1kg so với mùa hè"
  }
}
```

---

### 10. Update Specific Measurement

**Endpoint**: `PUT /users/measurements/:measurementId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Cập nhật một bộ số đo cụ thể

**Request Body**:

```json
{
  "chest": 97.0,
  "notes": "Điều chỉnh lại"
}
```

---

### 11. Delete Measurement

**Endpoint**: `DELETE /users/measurements/:measurementId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Xóa một bộ số đo

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Measurement deleted successfully"
}
```

---

### 12. Get All Users (Admin)

**Endpoint**: `GET /users`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Lấy danh sách tất cả users (có phân trang)

**Query Parameters**:

- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 10)
- `role` (optional): Lọc theo role (CUSTOMER, STAFF, ADMIN)
- `search` (optional): Tìm kiếm theo email hoặc fullName

**Example**: `GET /users?page=1&limit=20&role=CUSTOMER&search=nguyen`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "users": [
      {
        "id": "cm3h8...",
        "email": "user1@example.com",
        "fullName": "Nguyễn Văn A",
        "role": "CUSTOMER",
        "createdAt": "2025-11-23T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 13. Get User By ID (Admin)

**Endpoint**: `GET /users/:userId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Lấy chi tiết một user

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": "cm3h8...",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "role": "CUSTOMER",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "addresses": [...],
    "measurements": [...],
    "orders": [...]
  }
}
```

---

### 14. Delete User (Admin)

**Endpoint**: `DELETE /users/:userId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xóa user khỏi hệ thống

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

---

## 🛍️ Products Management

### Base Path: `/products`

---

### 1. Get All Products

**Endpoint**: `GET /products`  
**Auth Required**: ❌ No  
**Description**: Lấy danh sách sản phẩm (có phân trang và filter)

**Query Parameters**:

- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 10)
- `categoryId` (optional): Lọc theo category
- `minPrice` (optional): Giá tối thiểu
- `maxPrice` (optional): Giá tối đa
- `sortBy` (optional): Sắp xếp (name, price, createdAt)
- `order` (optional): Thứ tự (asc, desc)

**Example**: `GET /products?page=1&limit=12&categoryId=cat_1&minPrice=500000&sortBy=price&order=asc`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "products": [
      {
        "id": "prod_1",
        "name": "Vest Nam Cao Cấp",
        "description": "Vest nam công sở",
        "basePrice": 2500000,
        "imageUrl": "https://example.com/vest.jpg",
        "category": {
          "id": "cat_1",
          "name": "Vest"
        },
        "isActive": true,
        "createdAt": "2025-11-23T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 30,
      "itemsPerPage": 10
    }
  }
}
```

---

### 2. Search Products

**Endpoint**: `GET /products/search`  
**Auth Required**: ❌ No  
**Description**: Tìm kiếm sản phẩm theo từ khóa

**Query Parameters**:

- `q` (required): Từ khóa tìm kiếm
- `page` (optional): Số trang
- `limit` (optional): Số items mỗi trang

**Example**: `GET /products/search?q=vest&page=1&limit=10`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "products": [...],
    "pagination": {...}
  }
}
```

---

### 3. Get Product Detail

**Endpoint**: `GET /products/:productId`  
**Auth Required**: ❌ No  
**Description**: Lấy chi tiết một sản phẩm

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": "prod_1",
    "name": "Vest Nam Cao Cấp",
    "description": "Vest nam công sở chất liệu cao cấp",
    "basePrice": 2500000,
    "imageUrl": "https://example.com/vest.jpg",
    "category": {
      "id": "cat_1",
      "name": "Vest"
    },
    "fabrics": [
      {
        "id": "fabric_1",
        "name": "Vải Wool Italy",
        "pricePerMeter": 500000,
        "color": "Xanh Navy",
        "material": "Wool 100%"
      }
    ],
    "styleOptions": [
      {
        "id": "style_1",
        "name": "Cổ vest 2 khuy",
        "category": "COLLAR",
        "additionalPrice": 0
      }
    ],
    "isActive": true,
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

---

### 4. Create Product (Admin)

**Endpoint**: `POST /products`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Tạo sản phẩm mới

**Request Body**:

```json
{
  "name": "Áo Sơ Mi Nam Tay Dài",
  "description": "Áo sơ mi nam công sở",
  "basePrice": 800000,
  "imageUrl": "https://example.com/shirt.jpg",
  "categoryId": "cat_2",
  "isActive": true
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "id": "prod_2",
    "name": "Áo Sơ Mi Nam Tay Dài",
    "basePrice": 800000
  }
}
```

---

### 5. Update Product (Admin)

**Endpoint**: `PUT /products/:productId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Cập nhật thông tin sản phẩm

**Request Body**:

```json
{
  "name": "Áo Sơ Mi Nam Tay Dài Premium",
  "basePrice": 900000,
  "isActive": true
}
```

---

### 6. Delete Product (Admin)

**Endpoint**: `DELETE /products/:productId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xóa sản phẩm (soft delete)

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Product deleted successfully"
}
```

---

### 7. Add Fabric to Product (Admin)

**Endpoint**: `POST /products/:productId/fabrics/:fabricId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Thêm loại vải vào sản phẩm

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Fabric added to product successfully"
}
```

---

### 8. Remove Fabric from Product (Admin)

**Endpoint**: `DELETE /products/:productId/fabrics/:fabricId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xóa loại vải khỏi sản phẩm

---

### 9. Add Style Option to Product (Admin)

**Endpoint**: `POST /products/:productId/style-options/:styleOptionId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Thêm tùy chọn style vào sản phẩm

---

### 10. Remove Style Option from Product (Admin)

**Endpoint**: `DELETE /products/:productId/style-options/:styleOptionId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xóa tùy chọn style khỏi sản phẩm

---

### Categories Management

---

### 11. Get Products by Category

**Endpoint**: `GET /products/categories/:categoryId`  
**Auth Required**: ❌ No  
**Description**: Lấy danh sách sản phẩm theo category

**Query Parameters**:

- `page`, `limit`: Phân trang

---

### 12. Create Category (Admin)

**Endpoint**: `POST /products/categories`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Tạo category mới

**Request Body**:

```json
{
  "name": "Vest",
  "description": "Vest nam nữ cao cấp",
  "imageUrl": "https://example.com/category-vest.jpg"
}
```

---

### 13. Update Category (Admin)

**Endpoint**: `PUT /products/categories/:categoryId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Cập nhật category

---

### 14. Delete Category (Admin)

**Endpoint**: `DELETE /products/categories/:categoryId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xóa category

---

### Fabrics Management

---

### 15. Get All Fabrics

**Endpoint**: `GET /products/fabrics`  
**Auth Required**: ❌ No  
**Description**: Lấy danh sách tất cả loại vải

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "fabric_1",
      "name": "Vải Wool Italy",
      "description": "Vải wool cao cấp từ Italy",
      "pricePerMeter": 500000,
      "color": "Xanh Navy",
      "material": "Wool 100%",
      "imageUrl": "https://example.com/fabric.jpg"
    }
  ]
}
```

---

### 16. Create Fabric (Admin)

**Endpoint**: `POST /products/fabrics`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Tạo loại vải mới

**Request Body**:

```json
{
  "name": "Vải Cotton Cao Cấp",
  "description": "Cotton 100% thoáng mát",
  "pricePerMeter": 300000,
  "color": "Trắng",
  "material": "Cotton 100%",
  "imageUrl": "https://example.com/cotton.jpg"
}
```

---

### 17. Update Fabric (Admin)

**Endpoint**: `PUT /products/fabrics/:fabricId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN

---

### 18. Delete Fabric (Admin)

**Endpoint**: `DELETE /products/fabrics/:fabricId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN

---

### Style Options Management

---

### 19. Get All Style Options

**Endpoint**: `GET /products/style-options`  
**Auth Required**: ❌ No  
**Description**: Lấy danh sách tùy chọn style

**Query Parameters**:

- `category` (optional): Lọc theo loại (COLLAR, POCKET, BUTTON, FIT, etc.)

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "style_1",
      "name": "Cổ vest 2 khuy",
      "category": "COLLAR",
      "description": "Cổ vest kiểu Ý",
      "additionalPrice": 0,
      "imageUrl": "https://example.com/collar.jpg"
    }
  ]
}
```

---

### 20. Create Style Option (Admin)

**Endpoint**: `POST /products/style-options`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Tạo style option mới

**Request Body**:

```json
{
  "name": "Túi trong vest",
  "category": "POCKET",
  "description": "Thêm túi trong áo vest",
  "additionalPrice": 50000,
  "imageUrl": "https://example.com/pocket.jpg"
}
```

---

## 🛒 Orders Management

### Base Path: `/orders`

---

### 1. Create Order

**Endpoint**: `POST /orders`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Tạo đơn hàng mới

**Request Body**:

```json
{
  "addressId": "addr_1",
  "measurementId": "meas_1",
  "items": [
    {
      "productId": "prod_1",
      "fabricId": "fabric_1",
      "quantity": 1,
      "styleOptionIds": ["style_1", "style_2"],
      "notes": "May rộng hơn 1cm ở vai"
    }
  ],
  "paymentMethod": "COD",
  "notes": "Giao giờ hành chính"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "id": "order_1",
    "orderNumber": "ORD-20251123-001",
    "totalPrice": 3200000,
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "items": [...],
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

---

### 2. Get My Orders

**Endpoint**: `GET /orders`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy danh sách đơn hàng của user hiện tại

**Query Parameters**:

- `page`, `limit`: Phân trang
- `status` (optional): Lọc theo trạng thái (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "orders": [
      {
        "id": "order_1",
        "orderNumber": "ORD-20251123-001",
        "totalPrice": 3200000,
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "createdAt": "2025-11-23T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 3. Get Order Detail

**Endpoint**: `GET /orders/:orderId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy chi tiết đơn hàng

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": "order_1",
    "orderNumber": "ORD-20251123-001",
    "totalPrice": 3200000,
    "status": "IN_PROGRESS",
    "paymentStatus": "PAID",
    "paymentMethod": "COD",
    "items": [
      {
        "id": "item_1",
        "product": {
          "id": "prod_1",
          "name": "Vest Nam Cao Cấp"
        },
        "fabric": {
          "id": "fabric_1",
          "name": "Vải Wool Italy"
        },
        "quantity": 1,
        "unitPrice": 3000000,
        "styleOptions": [...]
      }
    ],
    "shippingAddress": {...},
    "measurements": {...},
    "assignedStaff": {
      "id": "staff_1",
      "fullName": "Thợ may Nguyễn Văn A"
    },
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T11:00:00.000Z"
  }
}
```

---

### 4. Cancel Order

**Endpoint**: `PUT /orders/:orderId/cancel`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Hủy đơn hàng (chỉ hủy được khi status là PENDING hoặc CONFIRMED)

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order_1",
    "status": "CANCELLED"
  }
}
```

---

### 5. Get All Orders (Admin/Staff)

**Endpoint**: `GET /orders/admin/all`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN, STAFF  
**Description**: Lấy tất cả đơn hàng trong hệ thống

**Query Parameters**:

- `page`, `limit`: Phân trang
- `status`: Lọc theo trạng thái
- `userId`: Lọc theo user
- `startDate`, `endDate`: Lọc theo khoảng thời gian

**Example**: `GET /orders/admin/all?page=1&status=IN_PROGRESS&startDate=2025-11-01`

---

### 6. Update Order Status (Admin/Staff)

**Endpoint**: `PUT /orders/:orderId/status`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN, STAFF  
**Description**: Cập nhật trạng thái đơn hàng

**Request Body**:

```json
{
  "status": "IN_PROGRESS",
  "notes": "Đã bắt đầu may"
}
```

**Available Status**:

- `PENDING`: Chờ xác nhận
- `CONFIRMED`: Đã xác nhận
- `IN_PROGRESS`: Đang thực hiện
- `COMPLETED`: Hoàn thành
- `CANCELLED`: Đã hủy

---

### 7. Assign Staff to Order (Admin)

**Endpoint**: `PATCH /orders/:orderId/assign-staff/:staffId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Gán thợ may cho đơn hàng

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "Staff assigned successfully",
  "data": {
    "orderId": "order_1",
    "assignedStaff": {
      "id": "staff_1",
      "fullName": "Thợ may Nguyễn Văn A"
    }
  }
}
```

---

### Reviews Management

---

### 8. Create Review

**Endpoint**: `POST /orders/:orderId/reviews`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Đánh giá đơn hàng (chỉ review được khi order COMPLETED)

**Request Body**:

```json
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt, thợ may tận tâm"
}
```

**Validation**:

- `rating`: 1-5 sao
- `comment`: Tối thiểu 10 ký tự

---

### 9. Get Order Reviews

**Endpoint**: `GET /orders/:orderId/reviews`  
**Auth Required**: ❌ No  
**Description**: Lấy reviews của một đơn hàng

---

### 10. Update Review

**Endpoint**: `PUT /orders/reviews/:reviewId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Cập nhật review (chỉ cập nhật được review của mình)

---

### 11. Delete Review

**Endpoint**: `DELETE /orders/reviews/:reviewId`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER, ADMIN  
**Description**: Xóa review

---

### Payment Management

---

### 12. Get Payment Info

**Endpoint**: `GET /orders/:orderId/payment`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy thông tin thanh toán của đơn hàng

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "orderId": "order_1",
    "totalAmount": 3200000,
    "paymentMethod": "COD",
    "paymentStatus": "UNPAID",
    "paidAt": null
  }
}
```

---

### 13. Confirm COD Payment (Staff/Admin)

**Endpoint**: `POST /orders/:orderId/payment/confirm-cod`  
**Auth Required**: ✅ Yes  
**Role**: STAFF, ADMIN  
**Description**: Xác nhận đã nhận tiền COD

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "message": "COD payment confirmed",
  "data": {
    "paymentStatus": "PAID",
    "paidAt": "2025-11-23T12:00:00.000Z"
  }
}
```

---

### 14. Payment Webhook

**Endpoint**: `POST /orders/payment/webhook`  
**Auth Required**: ❌ No (Internal webhook)  
**Description**: Webhook để nhận thông báo từ payment gateway (VNPay, Momo, etc.)

---

## 📅 Appointments Management

### Base Path: `/appointments`

---

### 1. Create Appointment

**Endpoint**: `POST /appointments`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Đặt lịch hẹn đo đạc

**Request Body**:

```json
{
  "appointmentDate": "2025-11-25T14:00:00.000Z",
  "notes": "Cần đo cho 2 bộ vest"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "message": "Appointment created successfully",
  "data": {
    "id": "appt_1",
    "appointmentNumber": "APT-20251123-001",
    "appointmentDate": "2025-11-25T14:00:00.000Z",
    "status": "PENDING",
    "notes": "Cần đo cho 2 bộ vest",
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

---

### 2. Get My Appointments

**Endpoint**: `GET /appointments`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy danh sách lịch hẹn của user

**Query Parameters**:

- `status` (optional): Lọc theo trạng thái (PENDING, CONFIRMED, COMPLETED, CANCELLED)

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "appt_1",
      "appointmentNumber": "APT-20251123-001",
      "appointmentDate": "2025-11-25T14:00:00.000Z",
      "status": "CONFIRMED",
      "assignedStaff": {
        "id": "staff_1",
        "fullName": "Nhân viên Nguyễn Văn A"
      }
    }
  ]
}
```

---

### 3. Get Available Time Slots

**Endpoint**: `GET /appointments/available-slots`  
**Auth Required**: ❌ No  
**Description**: Lấy các khung giờ còn trống để đặt lịch

**Query Parameters**:

- `date` (required): Ngày cần xem (format: YYYY-MM-DD)

**Example**: `GET /appointments/available-slots?date=2025-11-25`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "date": "2025-11-25",
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "10:00",
        "isAvailable": true
      },
      {
        "startTime": "10:00",
        "endTime": "11:00",
        "isAvailable": false
      },
      {
        "startTime": "14:00",
        "endTime": "15:00",
        "isAvailable": true
      }
    ]
  }
}
```

---

### 4. Get Appointment Detail

**Endpoint**: `GET /appointments/:id`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Lấy chi tiết lịch hẹn

---

### 5. Update Appointment Status (Staff/Admin)

**Endpoint**: `PATCH /appointments/:id/status`  
**Auth Required**: ✅ Yes  
**Role**: STAFF, ADMIN  
**Description**: Cập nhật trạng thái lịch hẹn

**Request Body**:

```json
{
  "status": "CONFIRMED",
  "notes": "Đã xác nhận lịch hẹn"
}
```

**Available Status**:

- `PENDING`: Chờ xác nhận
- `CONFIRMED`: Đã xác nhận
- `COMPLETED`: Hoàn thành
- `CANCELLED`: Đã hủy

---

### 6. Assign Staff to Appointment (Admin)

**Endpoint**: `PATCH /appointments/:id/assign-staff`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Gán nhân viên cho lịch hẹn

**Request Body**:

```json
{
  "staffId": "staff_1"
}
```

---

### 7. Cancel Appointment

**Endpoint**: `DELETE /appointments/:id`  
**Auth Required**: ✅ Yes  
**Role**: CUSTOMER  
**Description**: Hủy lịch hẹn

---

## 👨‍💼 Admin Dashboard

### Base Path: `/admin`

---

### 1. Get Dashboard Stats

**Endpoint**: `GET /admin/dashboard`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Lấy thống kê tổng quan

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalOrders": 150,
    "pendingOrders": 20,
    "completedOrders": 100,
    "totalRevenue": 450000000,
    "totalCustomers": 80,
    "totalAppointments": 60,
    "pendingAppointments": 10
  }
}
```

---

### 2. Get Recent Orders

**Endpoint**: `GET /admin/orders/recent`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Lấy danh sách đơn hàng gần đây

**Query Parameters**:

- `limit` (optional): Số lượng orders (default: 10)

---

### 3. Get Recent Appointments

**Endpoint**: `GET /admin/appointments/recent`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Lấy danh sách lịch hẹn gần đây

---

### 4. Get Revenue Report

**Endpoint**: `GET /admin/revenue`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Báo cáo doanh thu theo khoảng thời gian

**Query Parameters**:

- `startDate` (required): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (required): Ngày kết thúc (YYYY-MM-DD)
- `groupBy` (optional): Nhóm theo (day, week, month)

**Example**: `GET /admin/revenue?startDate=2025-11-01&endDate=2025-11-30&groupBy=day`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalRevenue": 450000000,
    "totalOrders": 150,
    "averageOrderValue": 3000000,
    "revenueByPeriod": [
      {
        "date": "2025-11-01",
        "revenue": 15000000,
        "orders": 5
      }
    ]
  }
}
```

---

### 5. Get Staff List

**Endpoint**: `GET /admin/staff`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Lấy danh sách nhân viên

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "staff_1",
      "fullName": "Thợ may Nguyễn Văn A",
      "email": "staff1@example.com",
      "phoneNumber": "0901234567",
      "role": "STAFF",
      "activeOrders": 5,
      "completedOrders": 50
    }
  ]
}
```

---

### 6. Get Staff Workload

**Endpoint**: `GET /admin/staff/workload`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xem khối lượng công việc của từng staff

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "staffId": "staff_1",
      "staffName": "Thợ may Nguyễn Văn A",
      "activeOrders": 5,
      "pendingAppointments": 3,
      "workload": "MEDIUM"
    }
  ]
}
```

---

### 7. Get Customer Statistics

**Endpoint**: `GET /admin/customers`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Thống kê khách hàng

**Query Parameters**:

- `sortBy` (optional): Sắp xếp theo (totalSpent, orderCount, lastOrderDate)
- `limit` (optional): Số lượng (default: 10)

---

### 8. Get Order Detail (Admin view)

**Endpoint**: `GET /admin/orders/:orderId`  
**Auth Required**: ✅ Yes  
**Role**: ADMIN  
**Description**: Xem chi tiết đơn hàng (admin view với đầy đủ thông tin)

---

## 🔄 Common Patterns

### Pagination Response Format

Tất cả endpoints có phân trang đều trả về format:

```json
{
  "statusCode": 200,
  "data": {
    "items": [...],  // hoặc products, orders, users, etc.
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Standard Success Response

```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {...}
}
```

### Authentication Header

Tất cả protected endpoints cần header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Query Parameters for Listing

Các parameters phổ biến:

- `page`: Số trang (default: 1)
- `limit`: Số items mỗi trang (default: 10)
- `sortBy`: Field để sort
- `order`: `asc` hoặc `desc`
- `search`: Từ khóa tìm kiếm

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "email must be a valid email",
    "password must be at least 6 characters"
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning               | Usage                                |
| ---- | --------------------- | ------------------------------------ |
| 200  | OK                    | Request thành công                   |
| 201  | Created               | Tạo resource thành công              |
| 400  | Bad Request           | Validation failed hoặc invalid input |
| 401  | Unauthorized          | Không có token hoặc token invalid    |
| 403  | Forbidden             | Không có quyền truy cập              |
| 404  | Not Found             | Resource không tồn tại               |
| 409  | Conflict              | Resource đã tồn tại (duplicate)      |
| 500  | Internal Server Error | Lỗi server                           |

### Common Error Messages

**401 Unauthorized**:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Token is invalid or expired"
}
```

**403 Forbidden**:

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "You do not have permission to access this resource"
}
```

**404 Not Found**:

```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "User with id 'xyz' not found"
}
```

**409 Conflict**:

```json
{
  "statusCode": 409,
  "message": "Conflict",
  "error": "Email already exists"
}
```

---

## 🔑 Role-Based Access Control (RBAC)

### Available Roles

1. **CUSTOMER**: Khách hàng
   - Đăng ký, đăng nhập
   - Quản lý profile, địa chỉ, số đo
   - Tạo và xem đơn hàng của mình
   - Đặt lịch hẹn
   - Review sản phẩm

2. **STAFF**: Nhân viên (thợ may)
   - Xem danh sách đơn hàng được giao
   - Cập nhật trạng thái đơn hàng
   - Xác nhận thanh toán COD
   - Xem lịch hẹn được giao

3. **ADMIN**: Quản trị viên
   - Tất cả quyền của STAFF
   - Quản lý users (CRUD)
   - Quản lý products, categories, fabrics, style options
   - Gán staff cho orders và appointments
   - Xem thống kê, báo cáo
   - Xóa reviews

### How to Check Roles in Frontend

Sau khi login, lưu user info và role:

```javascript
// Example: Store in localStorage or state management
const user = {
  id: "user_1",
  email: "user@example.com",
  role: "CUSTOMER", // hoặc STAFF, ADMIN
};

// Check role trước khi hiển thị UI
if (user.role === "ADMIN") {
  // Show admin dashboard
}

if (user.role === "STAFF" || user.role === "ADMIN") {
  // Show staff features
}
```

---

## 📝 Best Practices for Frontend Integration

### 1. Token Management

```javascript
// Store tokens securely
localStorage.setItem("accessToken", response.data.accessToken);
localStorage.setItem("refreshToken", response.data.refreshToken);

// Add to axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = localStorage.getItem("refreshToken");
      const { data } = await axios.post("/auth/refresh", { refreshToken });
      localStorage.setItem("accessToken", data.data.accessToken);
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

### 2. Error Handling

```javascript
try {
  const response = await axios.post("/orders", orderData);
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { statusCode, message, details } = error.response.data;

    if (statusCode === 400) {
      // Validation errors
      showValidationErrors(details);
    } else if (statusCode === 401) {
      // Redirect to login
      redirectToLogin();
    } else {
      // Show generic error
      showError(message);
    }
  } else {
    // Network error
    showError("Network error. Please try again.");
  }
}
```

### 3. Pagination

```javascript
const fetchProducts = async (page = 1, limit = 12) => {
  const response = await axios.get("/products", {
    params: { page, limit, sortBy: "createdAt", order: "desc" },
  });

  const { products, pagination } = response.data.data;

  return {
    products,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    hasMore: pagination.hasNextPage,
  };
};
```

### 4. File Uploads (Images)

```javascript
// Upload image for product
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data.imageUrl;
};
```

### 5. Real-time Price Calculation

```javascript
// Calculate order total
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    let itemPrice = item.product.basePrice;

    // Add fabric price
    if (item.fabric) {
      itemPrice += item.fabric.pricePerMeter * item.quantity;
    }

    // Add style options
    item.styleOptions?.forEach((option) => {
      itemPrice += option.additionalPrice;
    });

    return total + itemPrice;
  }, 0);
};
```

---

## 🚀 Testing with Swagger

Mở Swagger UI tại: `http://localhost:3001/api/docs`

### Steps to Test:

1. **Authorize**: Click "Authorize" button, nhập Bearer token
2. **Select Endpoint**: Chọn endpoint muốn test
3. **Fill Parameters**: Điền parameters và request body
4. **Execute**: Click "Execute" để gửi request
5. **View Response**: Xem response status, headers, body

### Example Test Flow:

```
1. POST /auth/sign-in
   → Lấy accessToken

2. Click "Authorize" → Nhập "Bearer <accessToken>"

3. GET /users/profile
   → Xem thông tin user

4. POST /orders
   → Tạo đơn hàng mới

5. GET /orders
   → Xem danh sách orders
```

---

## 📞 Support & Questions

Nếu có bất kỳ vấn đề nào trong quá trình tích hợp:

1. **Check Swagger**: http://localhost:3001/api/docs để xem chi tiết request/response
2. **Check Logs**: `docker compose logs -f app` để xem server logs
3. **Contact Backend Team**: Liên hệ trực tiếp qua Slack/Email

**Common Issues**:

- ❌ 401 Unauthorized: Kiểm tra token có đúng không
- ❌ 403 Forbidden: Kiểm tra role có đủ quyền không
- ❌ 400 Bad Request: Kiểm tra validation errors trong response
- ❌ 404 Not Found: Kiểm tra endpoint URL có đúng không

---

## 📊 API Status

| Module       | Status      | Endpoints     |
| ------------ | ----------- | ------------- |
| Auth         | ✅ Complete | 4 endpoints   |
| Users        | ✅ Complete | 14 endpoints  |
| Products     | ✅ Complete | 20+ endpoints |
| Orders       | ✅ Complete | 15 endpoints  |
| Appointments | ✅ Complete | 7 endpoints   |
| Admin        | ✅ Complete | 9 endpoints   |

**Total**: ~70+ endpoints sẵn sàng để tích hợp

---

**Last Updated**: November 23, 2025  
**API Version**: 1.0.0  
**Backend Repository**: https://github.com/Quan-Vo-Dinh/custom-tailor-backend
