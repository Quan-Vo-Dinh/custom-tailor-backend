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
│   ├── admin/              # Quản lý admin (dashboard, reports)
│   ├── appointments/       # Quản lý lịch hẹn đo đạc
│   ├── auth/               # Xác thực & phân quyền (JWT, Guards, Strategies)
│   ├── cache/              # Redis cache service
│   ├── common/             # Utilities, filters, interceptors, constants
│   ├── notifications/      # Email notifications (Resend + React Email)
│   ├── orders/             # Quản lý đơn hàng, thanh toán, review
│   ├── prisma/             # Prisma service & configuration
│   ├── products/           # Quản lý sản phẩm, vải, style options
│   ├── users/              # Quản lý người dùng, địa chỉ, số đo
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point & Swagger setup
├── prisma/
│   └── schema.prisma       # Database schema
├── emails/                 # React Email templates
├── docs/                   # Documentation
├── .env.example           # Environment variables template
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.x (Recommended: 20.x LTS)
- **PostgreSQL**: >= 14.x
- **Redis**: >= 6.x (Optional, dùng cho caching)
- **pnpm**: >= 8.x (hoặc npm/yarn)

## ⚙️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/Quan-Vo-Dinh/custom-tailor-backend.git
cd custom-tailor-backend
```

### 2. Cài đặt dependencies

```bash
# Sử dụng pnpm (recommended)
pnpm install

# Hoặc npm
npm install

# Hoặc yarn
yarn install
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

#### Option 1: PostgreSQL Local

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

#### Option 2: Docker

```bash
# Tạo file docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: custom_tailor_postgres
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: custom_tailor_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: custom_tailor_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Chạy Docker containers
docker-compose up -d
```

#### Option 3: Cloud Database (Neon, Supabase, Railway)

Cập nhật `DATABASE_URL` trong `.env` với connection string từ cloud provider.

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

### API Endpoints Overview:

| Module       | Base URL        | Description                    |
| ------------ | --------------- | ------------------------------ |
| Auth         | `/auth`         | Authentication & authorization |
| Users        | `/users`        | User management                |
| Products     | `/products`     | Products, categories, fabrics  |
| Orders       | `/orders`       | Order management & payments    |
| Appointments | `/appointments` | Appointment booking            |
| Admin        | `/admin`        | Admin dashboard & reports      |

## 🔐 Authentication

API sử dụng **JWT Bearer Token** authentication.

### Flow:

1. **Sign up**: `POST /auth/sign-up`
2. **Sign in**: `POST /auth/sign-in` → Nhận `accessToken`
3. **Sử dụng token**: Thêm header `Authorization: Bearer <accessToken>`

### Roles:

- **CUSTOMER**: Khách hàng (default)
- **STAFF**: Nhân viên may
- **ADMIN**: Quản trị viên

## 📧 Email Templates

Preview email templates với React Email:

```bash
# Chạy email dev server
pnpm run email:dev
```

Truy cập `http://localhost:3000` để xem preview các email templates:

- Appointment Confirmed
- Appointment Cancelled
- Order Confirmed
- Order Status Update

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e
```

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

## 🗂️ Modules chi tiết

### 🔐 Auth Module

**Chức năng:**

- Sign up / Sign in
- JWT token generation & refresh
- Role-based access control (RBAC)
- Guards: `JwtAuthGuard`, `RolesGuard`

**Endpoints:**

- `POST /auth/sign-up` - Đăng ký
- `POST /auth/sign-in` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `POST /auth/me` - Get current user

### 👤 Users Module

**Chức năng:**

- Quản lý profile người dùng
- Quản lý địa chỉ giao hàng
- Quản lý số đo cơ thể
- Admin: CRUD users

**Endpoints:**

- `GET /users/profile` - Get profile
- `PUT /users/profile` - Update profile
- `GET /users/addresses` - Get addresses
- `POST /users/addresses` - Create address
- `GET /users/measurements` - Get measurements
- Admin: `GET /users`, `DELETE /users/:id`

### 🛍️ Products Module

**Chức năng:**

- CRUD sản phẩm (Products)
- Quản lý danh mục (Categories)
- Quản lý vải (Fabrics)
- Quản lý tùy chọn style (Style Options)
- Gán vải & style options cho sản phẩm

**Endpoints:**

- `GET /products` - Get all products
- `GET /products/search` - Search products
- `POST /products` - Create product (Admin)
- `GET /products/fabrics` - Get fabrics
- `GET /products/style-options` - Get style options

### 📦 Orders Module

**Chức năng:**

- Tạo đơn hàng mới
- Theo dõi trạng thái đơn hàng
- Quản lý thanh toán (COD, SEPAY)
- Đánh giá (Reviews)
- Admin: Quản lý tất cả đơn hàng

**Order Status Flow:**

```
PENDING → CONFIRMED → MEASURING → IN_PRODUCTION →
QUALITY_CHECK → READY_FOR_DELIVERY → DELIVERED
```

**Endpoints:**

- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `PUT /orders/:id/cancel` - Cancel order
- Admin: `GET /orders/admin/all`, `PUT /orders/:id/status`
- `POST /orders/:id/reviews` - Create review
- `GET /orders/:id/payment` - Get payment

### 📅 Appointments Module

**Chức năng:**

- Đặt lịch hẹn đo đạc
- Xem time slots available
- Quản lý trạng thái lịch hẹn
- Staff assignment

**Appointment Status:**

- `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`

**Endpoints:**

- `POST /appointments` - Create appointment
- `GET /appointments/available-slots` - Get available slots
- `PATCH /appointments/:id/status` - Update status (Staff/Admin)

### 📊 Admin Module

**Chức năng:**

- Dashboard statistics
- Recent orders & appointments
- Revenue reports
- Staff management & workload
- Customer management

**Endpoints:**

- `GET /admin/dashboard` - Dashboard stats
- `GET /admin/revenue` - Revenue report
- `GET /admin/staff` - Staff members
- `GET /admin/staff/workload` - Staff workload

### 📧 Notifications Module

**Chức năng:**

- Gửi email thông báo tự động
- React Email templates
- Resend API integration

**Email Types:**

- Order Confirmation
- Order Status Updates
- Appointment Confirmation
- Appointment Cancellation

## 🏗️ Architecture Patterns

### 1. Module-based Structure

Mỗi feature được tổ chức thành module độc lập với:

- Controller (HTTP layer)
- Service (Business logic)
- DTOs (Data Transfer Objects)
- Guards & Decorators

### 2. Dependency Injection

NestJS DI container quản lý dependencies tự động.

### 3. Guards & Interceptors

- **JwtAuthGuard**: Xác thực JWT token
- **RolesGuard**: Phân quyền theo role
- **LoggingInterceptor**: Log requests
- **TransformInterceptor**: Transform responses

### 4. Exception Handling

- Global exception filters
- Custom error messages
- Validation errors

## 🔒 Security Best Practices

- ✅ JWT với expiration
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ Input validation với class-validator
- ✅ SQL injection prevention (Prisma)
- ✅ Rate limiting (recommended for production)

## 🚀 Deployment

### Environment Variables (Production)

Đảm bảo set các biến môi trường sau cho production:

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-random-secret"
REDIS_URL="redis://..."
RESEND_API_KEY="re_..."
```

### Build & Deploy

```bash
# Build
pnpm run build

# Run migrations
pnpm run prisma:migrate:prod

# Start
pnpm run start:prod
```

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

## 🐛 Troubleshooting

### Common Issues:

**1. Database connection failed**

```bash
# Kiểm tra PostgreSQL đang chạy
sudo service postgresql status

# Kiểm tra connection string trong .env
```

**2. Prisma Client errors**

```bash
# Re-generate Prisma Client
pnpm run prisma:generate
```

**3. Redis connection failed**

```bash
# Redis là optional, có thể comment REDIS_URL trong .env
```

**4. Build errors**

```bash
# Clear cache và rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

## 📖 Documentation

Tài liệu chi tiết trong folder `/docs`:

- [Architecture Design](docs/architecture-design.md)
- [Business Analysis](docs/business-analysis.md)
- [Database Design](docs/database-design.md)
- [Sequence Diagrams](docs/sequence-diagram.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit Pull Request

## 📝 Code Style

Dự án sử dụng:

- **ESLint**: Linting rules
- **Prettier**: Code formatting
- **TypeScript**: Strict mode

Chạy trước khi commit:

```bash
pnpm run lint
pnpm run format
```

## 📄 License

Private project - All rights reserved

## 👥 Team

- Developer: [Quan Vo Dinh](https://github.com/Quan-Vo-Dinh)

## 📞 Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/Quan-Vo-Dinh/custom-tailor-backend/issues)
- Email: contact@example.com

---

**Made with ❤️ using NestJS**
