# Hướng Dẫn Seed Database

## Chạy Seed

```bash
cd custom-tailor-server
npm run prisma:seed
```

Hoặc nếu chưa cài ts-node:

```bash
npx ts-node prisma/seed.ts
```

## Dữ Liệu Được Tạo

### Users
- **Admin**: admin@customtailor.com / password123
- **Staff 1**: staff1@customtailor.com / password123
- **Staff 2**: staff2@customtailor.com / password123
- **Customer 1**: customer1@example.com / password123 (có addresses và measurements)
- **Customer 2**: customer2@example.com / password123

### Categories
- SUIT (suit)
- SHIRT (shirt)
- DRESS (dress)
- COAT (coat)
- PANTS (pants)
- VEST (vest)

### Products
- Vest Cao Cấp 2 Mảnh (5,000,000 VND) - Featured
- Vest Cao Cấp 3 Mảnh (7,000,000 VND) - Featured
- Sơ Mi Cao Cấp (2,000,000 VND) - Featured
- Sơ Mi Cổ Điển (1,500,000 VND)
- Váy Dạ Hội Cao Cấp (6,000,000 VND) - Featured
- Áo Khoác Dạ Cao Cấp (8,000,000 VND) - Featured
- Quần Âu Cao Cấp (3,000,000 VND)
- Áo Gile Cao Cấp (2,500,000 VND)

### Fabrics (6 loại)
- Lụa Tơ Tằm (+500,000 VND)
- Len Merino (+800,000 VND)
- Cotton Pima (+300,000 VND)
- Linen Premium (+400,000 VND)
- Cashmere (+1,200,000 VND)
- Cotton Oxford (+200,000 VND)

### Style Options (10 loại)
- Cổ áo: Cổ Đức, Cổ Tròn, Cổ V
- Kiểu tay: Tay Dài, Tay Ngắn, Tay 3/4
- Cổ tay: Cổ Tay Thường, Cổ Tay Pháp
- Khuy áo: Khuy Nhựa, Khuy Ngọc Trai

### Orders (3 đơn hàng)
- Order 1: Customer 1 - Vest 2 mảnh - CONFIRMED
- Order 2: Customer 2 - Sơ mi cao cấp - PENDING
- Order 3: Customer 1 - Sơ mi cổ điển - COMPLETED (có review)

### Appointments (2 lịch hẹn)
- Appointment 1: Customer 1 - Ngày mai 10:00 - CONFIRMED
- Appointment 2: Customer 2 - Tuần sau 14:00 - PENDING

## Lưu Ý

- Seed sẽ xóa toàn bộ dữ liệu cũ trước khi tạo mới
- Tất cả passwords đều là: `password123`
- Images sử dụng placeholder URLs, có thể thay thế sau

