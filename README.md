# Custom Tailor Backend API

Backend API cho hệ thống E-commerce May Đo (Custom Tailor Platform) được xây dựng với NestJS, Prisma và PostgreSQL.

## 🚀 Công nghệ sử dụng

- **Framework**: NestJS 11.x (Node.js framework)
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.x
- **Authentication**: JWT + Passport
- **Email**: Resend với React Email templates
- **Cache**: Redis 4.x
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Language**: TypeScript 5.3

## 📁 Cấu trúc dự án

```
custom-tailor-server/
├── src/
│   ├── auth/               # ✅ Xác thực & phân quyền (JWT, Guards, Strategies)
│   ├── cache/              # ✅ Redis cache service
│   ├── common/             # ✅ Utilities, filters, interceptors, constants
│   ├── notifications/      # ✅ Email notifications (Resend + React Email)
│   ├── prisma/             # ✅ Prisma service & configuration
│   ├── users/              # 🚧 Quản lý người dùng (Coming soon)
│   ├── products/           # 🚧 Quản lý sản phẩm (Coming soon)
│   ├── orders/             # 🚧 Quản lý đơn hàng (Coming soon)
│   ├── appointments/       # 🚧 Quản lý lịch hẹn (Coming soon)
│   ├── admin/              # 🚧 Quản lý admin (Coming soon)
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point & Swagger setup
├── prisma/
│   └── schema.prisma       # Database schema
├── emails/                 # ✅ React Email templates
├── docs/                   # Documentation
├── .env.example           # Environment variables template
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

## 📋 Yêu cầu hệ thống

### 🐳 Option 1: Docker (Recommended - Cho Frontend Team)

- **Docker Desktop**: >= 20.x
- **Docker Compose**: >= 2.x

➡️ **[Xem hướng dẫn nhanh cho Frontend Team](./FRONTEND-SETUP.md)**

### 💻 Option 2: Local Development

- **Node.js**: >= 18.x (Recommended: 20.x LTS)
- **PostgreSQL**: >= 14.x
- **pnpm**: >= 8.x
- **Redis**: >= 6.x (Optional, dùng cho caching)

---

## 🚀 Quick Start với Docker

### Dành cho Frontend Team (Chỉ cần test API)

```bash
# 1. Clone repository
git clone https://github.com/Quan-Vo-Dinh/custom-tailor-backend.git
cd custom-tailor-backend

# 2. Khởi động Backend
docker compose up -d

# ✅ Xong! API sẵn sàng tại:
# - API: http://localhost:3001
# - Swagger Docs: http://localhost:3001/api/docs
```

**Các commands cơ bản:**

```bash
docker compose up -d      # Khởi động
docker compose logs -f    # Xem logs
docker compose down       # Dừng lại
docker compose ps         # Kiểm tra status
```

**Xem Email Templates (Optional):**

```bash
# Start email preview service
docker compose --profile email up email-preview -d

# Access at: http://localhost:3002
```

➡️ **Chi tiết hơn**: Xem file [FRONTEND-SETUP.md](./FRONTEND-SETUP.md)

---

## ⚙️ Cài đặt Local (Không dùng Docker)

### 1. Clone repository

```bash
git clone https://github.com/Quan-Vo-Dinh/custom-tailor-backend.git
cd custom-tailor-backend
```

### 2. Cài đặt dependencies

```bash
# Sử dụng pnpm
pnpm install
```

### 3. Cấu hình biến môi trường

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/custom_tailor_db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Redis Cache (Optional - defaults to redis://localhost:6379)
REDIS_URL="redis://localhost:6379"

# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# Server Configuration
PORT=3001
NODE_ENV="development"
```

### 4. Thiết lập PostgreSQL Database

```bash
# Cài đặt PostgreSQL
sudo apt install postgresql postgresql-contrib

# Tạo database và user
sudo -u postgres psql
CREATE DATABASE custom_tailor_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE custom_tailor_db TO your_user;
\q
```

**Hoặc dùng Cloud Database:** Neon, Supabase, Railway - cập nhật `DATABASE_URL` trong `.env`

### 5. Chạy Prisma Migrations

```bash
# Generate Prisma Client
pnpm run prisma:generate

# Chạy migrations để tạo schema
pnpm run prisma:migrate

# (Optional) Seed database với dữ liệu mẫu
# pnpm run prisma:seed
```

### 6. (Optional) Xem database với Prisma Studio

```bash
pnpm run prisma:studio
```

Truy cập `http://localhost:5555` để xem và quản lý database.

## 🏃 Chạy ứng dụng

### Development mode (with hot-reload)

```bash
pnpm run start:dev
```

Server sẽ chạy tại: **http://localhost:3001**

### Debug mode (with debugging support)

```bash
pnpm run start:debug
```

Attach debugger tại port **9229**.

### Production mode

```bash
# Build application
pnpm run build

# Start production server
pnpm run start:prod
```

## 📚 API Documentation

Sau khi chạy server, truy cập **Swagger UI** tại:

```
http://localhost:3001/api/docs
```

### Swagger Features:

- ✅ Interactive API testing
- ✅ Request/Response schemas
- ✅ Authentication (Bearer Token)
- ✅ Example values
- ✅ Role-based access documentation

## ✅ Implemented Features

### 🔐 Auth Module (Completed)

**Chức năng:**

- ✅ Sign up / Sign in
- ✅ JWT token generation & refresh
- ✅ Role-based access control (RBAC)
- ✅ Guards: `JwtAuthGuard`, `RolesGuard`
- ✅ Decorators: `@CurrentUser()`, `@Roles()`

**Endpoints:**

- `POST /auth/sign-up` - Đăng ký tài khoản
- `POST /auth/sign-in` - Đăng nhập
- `POST /auth/refresh` - Refresh access token
- `POST /auth/me` - Lấy thông tin user hiện tại

**Authentication Flow:**

1. User đăng ký: `POST /auth/sign-up`
2. User đăng nhập: `POST /auth/sign-in` → Nhận `accessToken` & `refreshToken`
3. Sử dụng token: Thêm header `Authorization: Bearer <accessToken>`
4. Refresh khi hết hạn: `POST /auth/refresh`

**Roles hỗ trợ:**

- `CUSTOMER`: Khách hàng (default)
- `STAFF`: Nhân viên may
- `ADMIN`: Quản trị viên

### 📧 Notifications Module (Completed)

**Chức năng:**

- ✅ Gửi email thông báo tự động
- ✅ React Email templates
- ✅ Resend API integration
- ✅ 4 loại email templates

**Email Templates:**

1. **Appointment Confirmed** - Xác nhận lịch hẹn
2. **Appointment Cancelled** - Hủy lịch hẹn
3. **Order Confirmed** - Xác nhận đơn hàng
4. **Order Status Update** - Cập nhật trạng thái đơn hàng

**Preview Email Templates:**

```bash
# Chạy email dev server
pnpm run email:dev
```

Truy cập `http://localhost:3000` để xem preview tất cả email templates.

### 🏗️ Core Infrastructure (Completed)

**Đã triển khai:**

- ✅ NestJS application setup với TypeScript
- ✅ Prisma ORM với PostgreSQL
- ✅ Redis caching service
- ✅ Global exception filters
- ✅ Logging interceptor
- ✅ Response transformation interceptor
- ✅ Validation pipes với class-validator
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration
- ✅ Environment configuration

## 🚧 Coming Soon

- 🚧 **Users Module** - Quản lý profile, địa chỉ, số đo
- 🚧 **Products Module** - Sản phẩm, vải, style options
- 🚧 **Orders Module** - Đơn hàng, thanh toán, reviews
- 🚧 **Appointments Module** - Đặt lịch hẹn đo đạc
- 🚧 **Admin Module** - Dashboard, reports, quản lý

## 🔧 Scripts & Commands

### Development

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `pnpm run start:dev`   | Start dev server with hot-reload |
| `pnpm run start:debug` | Start with debugger              |
| `pnpm run lint`        | Lint code với ESLint             |
| `pnpm run format`      | Format code với Prettier         |

### Build & Production

| Command               | Description             |
| --------------------- | ----------------------- |
| `pnpm run build`      | Build production bundle |
| `pnpm run start:prod` | Start production server |

### Database (Prisma)

| Command                        | Description                    |
| ------------------------------ | ------------------------------ |
| `pnpm run prisma:generate`     | Generate Prisma Client         |
| `pnpm run prisma:migrate`      | Run migrations (dev)           |
| `pnpm run prisma:migrate:prod` | Deploy migrations (production) |
| `pnpm run prisma:studio`       | Open Prisma Studio             |

### Email Templates

| Command              | Description             |
| -------------------- | ----------------------- |
| `pnpm run email:dev` | Preview email templates |

## 🐛 Troubleshooting

### Common Issues:

**1. Database connection failed**

```bash
# Kiểm tra PostgreSQL đang chạy
sudo service postgresql status

# Kiểm tra connection string trong .env
echo $DATABASE_URL
```

**2. Prisma Client errors**

```bash
# Re-generate Prisma Client
pnpm run prisma:generate

# Reset database (development only)
pnpm run prisma:migrate:reset
```

**3. Redis connection failed**

```bash
# Redis là optional, có thể comment REDIS_URL trong .env nếu không dùng

# Hoặc start Redis
sudo service redis-server start
```

**4. Build errors**

```bash
# Clear cache và rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

**5. Email sending failed**

```bash
# Kiểm tra RESEND_API_KEY trong .env
# Đăng ký tại https://resend.com để lấy API key
```

## 📖 Documentation

Tài liệu chi tiết trong folder `/docs`:

- [Architecture Design](docs/architecture-design.md)
- [Business Analysis](docs/business-analysis.md)
- [Database Design](docs/database-design.md)
- [Sequence Diagrams](docs/sequence-diagram.md)
