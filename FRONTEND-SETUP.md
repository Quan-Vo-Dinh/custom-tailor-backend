# 🚀 Quick Start for Frontend Team

Hướng dẫn siêu đơn giản để chạy Backend API cho frontend development.

## ✅ Yêu cầu

Chỉ cần cài **Docker Desktop**:
- **Windows/Mac**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

## 🎯 Cách sử dụng (3 bước)

### 1. Clone repository

```bash
git clone https://github.com/Quan-Vo-Dinh/custom-tailor-backend.git
cd custom-tailor-backend
```

### 2. Khởi động Backend

```bash
docker compose up -d
```

**Chờ ~2-3 phút** để build lần đầu. Các lần sau sẽ nhanh hơn (~30 giây).

### 3. Truy cập API

- **API Base URL**: `http://localhost:3001`
- **Swagger Documentation**: `http://localhost:3001/api/docs`

**✅ Xong!** Backend đã sẵn sàng cho frontend development.

---

## 📚 Sử dụng API

### Swagger UI (Recommended)

Mở trình duyệt: **http://localhost:3001/api/docs**

- ✅ Xem tất cả endpoints
- ✅ Test API trực tiếp
- ✅ Xem request/response schemas
- ✅ Copy example code

### Authentication

Hầu hết APIs yêu cầu JWT token:

**1. Đăng ký tài khoản:**
```bash
curl -X POST http://localhost:3001/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phoneNumber": "0123456789"
  }'
```

**2. Đăng nhập:**
```bash
curl -X POST http://localhost:3001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response sẽ trả về `accessToken`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

**3. Sử dụng token trong requests:**
```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Hoặc trong Swagger: Click nút **Authorize** 🔒, nhập token.

---

## 🛠️ Commands hữu ích

```bash
# Khởi động backend
docker compose up -d

# Xem logs (nếu có lỗi)
docker compose logs -f app

# Dừng backend
docker compose down

# Xóa data và restart (reset database)
docker compose down -v
docker compose up -d

# Kiểm tra trạng thái
docker compose ps
```

---

## 📋 Available APIs

### ✅ Auth Module (Hoàn thành)
- `POST /auth/sign-up` - Đăng ký
- `POST /auth/sign-in` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Thông tin user hiện tại

### 🚧 Coming Soon
- Users API - Quản lý profile, địa chỉ, số đo
- Products API - Sản phẩm, vải, style options
- Orders API - Đơn hàng, thanh toán, reviews
- Appointments API - Đặt lịch hẹn

---

## ❓ Troubleshooting

### Port 3001 đã được sử dụng

**Lỗi:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Giải pháp 1:** Dừng process đang dùng port 3001
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

**Giải pháp 2:** Đổi port trong `docker-compose.yml`
```yaml
services:
  app:
    ports:
      - "3002:3001"  # Đổi thành port 3002
```

### Backend không khởi động

```bash
# Xem logs để biết lỗi gì
docker compose logs app

# Restart lại
docker compose restart app
```

### Xóa toàn bộ và cài lại

```bash
# Xóa containers, volumes, images
docker compose down -v
docker rmi custom-tailor-backend-app

# Build và start lại
docker compose up -d --build
```

---

## 💡 Tips

### Test nhanh với curl

```bash
# Health check
curl http://localhost:3001/health

# Sign up
curl -X POST http://localhost:3001/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"123456","fullName":"Dev Test","phoneNumber":"0901234567"}'

# Sign in và lưu token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"123456"}' | jq -r '.accessToken')

# Dùng token
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test với Postman

1. Import Swagger: `http://localhost:3001/api-json`
2. Hoặc dùng Swagger UI trực tiếp: `http://localhost:3001/api/docs`

---

## 📞 Cần hỗ trợ?

- Swagger API Docs: http://localhost:3001/api/docs
- GitHub Issues: [Report a bug](https://github.com/Quan-Vo-Dinh/custom-tailor-backend/issues)

---

**Happy coding! 🎉**
