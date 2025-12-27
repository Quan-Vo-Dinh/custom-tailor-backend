# API Updates - Hoàn thiện Backend APIs

## Tổng quan
Đã hoàn thiện các API endpoints còn thiếu để match với frontend requirements.

## Các API đã thêm/cập nhật

### Products APIs

#### 1. GET /products/categories
- **Mô tả**: Lấy danh sách tất cả categories với số lượng sản phẩm
- **Response format**: 
```json
[
  {
    "value": "cat_123",
    "label": "Vest",
    "count": 10
  }
]
```

#### 2. GET /products/fabrics/:id
- **Mô tả**: Lấy chi tiết một fabric
- **Response**: Fabric object với đầy đủ thông tin

#### 3. GET /products/style-options/:id
- **Mô tả**: Lấy chi tiết một style option
- **Response**: StyleOption object với đầy đủ thông tin

#### 4. Cập nhật GET /products
- **Thay đổi**: 
  - Hỗ trợ pagination với `page` và `limit` thay vì `skip` và `take`
  - Thêm các filter: `search`, `category`, `minPrice`, `maxPrice`, `featured`, `sortBy`, `sortOrder`
- **Response format**:
```json
{
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

#### 5. Cập nhật GET /products/search
- **Thay đổi**: Hỗ trợ `page` và `limit` thay vì `skip` và `take`
- **Query param**: `q` thay vì `query`
- **Response format**: Tương tự GET /products với meta pagination

#### 6. Cập nhật GET /products/fabrics
- **Thêm query params**: `productId`, `category` để filter fabrics

#### 7. Cập nhật GET /products/style-options
- **Thêm query params**: `productId`, `category` để filter style options

### Appointments APIs

#### 1. GET /appointments/my
- **Mô tả**: Lấy appointments của user hiện tại (customer)
- **Query params**: `status`, `fromDate`, `toDate`
- **Response**: Array of appointments

#### 2. Cập nhật GET /appointments
- **Thêm query params**: `status`, `fromDate`, `toDate` để filter appointments

#### 3. GET /appointments/check-availability
- **Mô tả**: Kiểm tra xem một time slot có sẵn không
- **Query params**: `date`, `startTime`, `endTime`
- **Response**: 
```json
{
  "available": true
}
```

#### 4. GET /appointments/stats
- **Mô tả**: Lấy thống kê appointments (admin/staff only)
- **Query params**: `fromDate`, `toDate`
- **Response**:
```json
{
  "total": 100,
  "pending": 10,
  "confirmed": 20,
  "completed": 60,
  "cancelled": 8,
  "noShow": 2
}
```

#### 5. PATCH /appointments/:id/reschedule
- **Mô tả**: Đổi lịch hẹn sang thời gian mới
- **Body**:
```json
{
  "date": "2025-11-20",
  "startTime": "14:00",
  "endTime": "15:00"
}
```

#### 6. PATCH /appointments/:id/cancel
- **Mô tả**: Hủy appointment (thay thế DELETE endpoint)
- **Response**: Appointment object đã được cập nhật status = CANCELLED

#### 7. Cập nhật GET /appointments/available-slots
- **Thêm query param**: `type` (optional)
- **Response format**: 
```json
[
  {
    "id": "slot_1",
    "date": "2025-11-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "available": true
  }
]
```

## Lưu ý về Response Format

### Products Response
Frontend expects:
- `availableFabrics` thay vì `fabrics`
- `availableStyles` thay vì `styleOptions`
- `category` là enum (ProductCategory) thay vì object
- `images` là array of strings

**Cần transform response** trong service hoặc controller để match frontend expectations.

### Pagination Format
Tất cả endpoints có pagination đều trả về format:
```json
{
  "data": [...],
  "meta": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

## Testing
1. Test tất cả endpoints mới với Swagger UI: http://localhost:3001/api/docs
2. Verify response format match với frontend types
3. Test pagination với các page numbers khác nhau
4. Test filters và sorting

## Next Steps
1. Transform product response để match frontend types (availableFabrics, availableStyles, etc.)
2. Add featured field to Product schema nếu cần
3. Test integration với frontend
4. Fix any type mismatches

