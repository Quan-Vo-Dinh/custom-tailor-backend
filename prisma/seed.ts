import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  AppointmentStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ========== IMAGE PATH HELPERS ==========
const IMG_BASE = "/images/products";

// Helper function to encode Vietnamese file names for URLs
function encodeImagePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

// ========== SEED DATA ==========

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.address.deleteMany();
  await prisma.profile.deleteMany();
  // Disconnect many-to-many relations
  await prisma.product.updateMany({
    data: {},
  });
  await prisma.styleOption.deleteMany();
  await prisma.fabric.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ========== CREATE USERS ==========
  console.log("👥 Creating users...");

  const admin = await prisma.user.create({
    data: {
      email: "admin@customtailor.com",
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          fullName: "Quản Trị Viên",
          phone: "0901234567",
        },
      },
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: "staff1@customtailor.com",
      passwordHash: hashedPassword,
      role: Role.STAFF,
      profile: {
        create: {
          fullName: "Nguyễn Văn An",
          phone: "0901234568",
        },
      },
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: "staff2@customtailor.com",
      passwordHash: hashedPassword,
      role: Role.STAFF,
      profile: {
        create: {
          fullName: "Trần Thị Bình",
          phone: "0901234569",
        },
      },
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "customer1@example.com",
      passwordHash: hashedPassword,
      role: Role.CUSTOMER,
      profile: {
        create: {
          fullName: "Lê Văn Cường",
          phone: "0901234570",
        },
      },
      addresses: {
        create: [
          {
            street: "123 Đường Nguyễn Huệ",
            city: "Quận 1",
            country: "Hồ Chí Minh",
            isDefault: true,
          },
          {
            street: "456 Đường Lê Lợi",
            city: "Quận 3",
            country: "Hồ Chí Minh",
            isDefault: false,
          },
        ],
      },
      measurements: {
        create: [
          {
            name: "Số đo Áo dài",
            details: {
              vai: 40,
              nguc: 90,
              eo: 70,
              mong: 95,
              daiAo: 130,
              daiTay: 58,
            },
          },
          {
            name: "Số đo Vest",
            details: {
              vai: 45,
              nguc: 100,
              eo: 85,
              mong: 95,
              daiAo: 75,
              daiTay: 62,
            },
          },
        ],
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "customer2@example.com",
      passwordHash: hashedPassword,
      role: Role.CUSTOMER,
      profile: {
        create: {
          fullName: "Phạm Thị Dung",
          phone: "0901234571",
        },
      },
      addresses: {
        create: [
          {
            street: "789 Đường Trần Hưng Đạo",
            city: "Quận 5",
            country: "Hồ Chí Minh",
            isDefault: true,
          },
        ],
      },
    },
  });

  // ========== CREATE CATEGORIES ==========
  console.log("📁 Creating categories...");

  const categoryAoDaiNam = await prisma.category.create({
    data: { name: "Áo Dài Nam", slug: "ao-dai-nam" },
  });

  const categoryVestNam = await prisma.category.create({
    data: { name: "Vest Nam", slug: "vest-nam" },
  });

  const categoryVay = await prisma.category.create({
    data: { name: "Váy", slug: "vay" },
  });

  const categoryAoDaiNu = await prisma.category.create({
    data: { name: "Áo Dài Nữ", slug: "ao-dai-nu" },
  });

  const categorySuonXam = await prisma.category.create({
    data: { name: "Sườn Xám", slug: "suon-xam" },
  });

  const categoryVayDemo = await prisma.category.create({
    data: { name: "Váy May Đo", slug: "vay-may-do" },
  });

  // ========== CREATE FABRICS (From SP TEST) ==========
  console.log("🧵 Creating fabrics...");

  const fabricV1 = await prisma.fabric.create({
    data: {
      name: "Vải Cotton Ai Cập",
      description: "Vải mịn, sáng, thanh lịch - Màu Trắng",
      material: "100% Cotton Ai Cập",
      color: "Trắng",
      priceAdjustment: 500000,
      stock: 100,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/1. V - Loại vải/V1 - Vải Cotton Ai Cập (Trắng) Ảnh vải mịn, sáng, thanh lịch.png`
      ),
    },
  });

  const fabricV2 = await prisma.fabric.create({
    data: {
      name: "Vải Wool Luxury",
      description: "Vải có độ bóng nhẹ, sang trọng - Màu Xanh Navy",
      material: "100% Wool cao cấp",
      color: "Xanh Navy",
      priceAdjustment: 800000,
      stock: 50,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/1. V - Loại vải/V2 - vải  Wool Luxury (Xanh Navy) Ảnh vải có độ bóng nhẹ, sang trọng.png`
      ),
    },
  });

  const fabricV3 = await prisma.fabric.create({
    data: {
      name: "Vải Linen Premium",
      description: "Vải có độ nhám tự nhiên, phong cách phóng khoáng - Màu Be",
      material: "100% Linen cao cấp",
      color: "Be",
      priceAdjustment: 400000,
      stock: 80,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/1. V - Loại vải/V3 - Vải Linen Premium (Be) Ảnh có độ nhám tự nhiên, phong cách phóng khoáng.png`
      ),
    },
  });

  const fabricV4 = await prisma.fabric.create({
    data: {
      name: "Vải Wool Cashmere",
      description: "Vải mềm mại, ấm áp và đẳng cấp - Màu Xám Than",
      material: "80% Wool, 20% Cashmere",
      color: "Xám Than",
      priceAdjustment: 1200000,
      stock: 30,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/1. V - Loại vải/V4 - Vải Wool Cashmere (Xám Than) Ảnh cho thấy độ mềm mại, ấm áp và đẳng cấp.png`
      ),
    },
  });

  const fabricV5 = await prisma.fabric.create({
    data: {
      name: "Vải Silk Cotton",
      description: "Vải có độ rủ và ánh lụa - Màu Xanh Nhạt trầm",
      material: "60% Silk, 40% Cotton",
      color: "Xanh Nhạt",
      priceAdjustment: 600000,
      stock: 60,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/1. V - Loại vải/V5 - Vải Silk Cotton (Xanh Nhạt trầm) Ảnh có độ rủ và ánh lụa.png`
      ),
    },
  });

  const fabricV6 = await prisma.fabric.create({
    data: {
      name: "Vải Mohair Blend",
      description: "Vải đen sâu, đanh và giữ form tốt - Màu Đen",
      material: "70% Wool, 30% Mohair",
      color: "Đen",
      priceAdjustment: 1000000,
      stock: 40,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/1. V - Loại vải/V6 - Vải Mohair Blend (Đen) Ảnh vải đen sâu, đanh và giữ form tốt..png`
      ),
    },
  });

  // ========== CREATE STYLE OPTIONS ==========
  console.log("🎨 Creating style options...");

  // Nút áo
  const buttonN1 = await prisma.styleOption.create({
    data: {
      name: "Nút kim loại vàng",
      type: "Nút áo",
      description: "Nút kim loại mạ vàng sang trọng",
      priceAdjustment: 100000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/2. N - Loại nút áo/N1 - Nút kim loại.png`
      ),
    },
  });

  const buttonN2 = await prisma.styleOption.create({
    data: {
      name: "Nút vân sừng",
      type: "Nút áo",
      description: "Nút vân sừng tự nhiên, cổ điển",
      priceAdjustment: 150000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/2. N - Loại nút áo/N2 - Nút vân sừng.png`
      ),
    },
  });

  const buttonN3 = await prisma.styleOption.create({
    data: {
      name: "Nút kim loại premium",
      type: "Nút áo",
      description: "Nút kim loại cao cấp, thiết kế độc đáo",
      priceAdjustment: 200000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/2. N - Loại nút áo/N3 - Nút kim loại premium.png`
      ),
    },
  });

  // Kiểu tay
  const sleeveT2 = await prisma.styleOption.create({
    data: {
      name: "Tay dài thông thường",
      type: "Kiểu tay",
      description: "Tay áo dài cổ điển, thanh lịch",
      priceAdjustment: 0,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/3. T - Loại tay áo/T2- Tay dài thông thường.png`
      ),
    },
  });

  const sleeveT3 = await prisma.styleOption.create({
    data: {
      name: "Tay bồng",
      type: "Kiểu tay",
      description: "Tay bồng phồng nhẹ, nữ tính",
      priceAdjustment: 150000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/3. T - Loại tay áo/T3 - Tay bồng.png`
      ),
    },
  });

  const sleeveT4 = await prisma.styleOption.create({
    data: {
      name: "Tay dài có gấu",
      type: "Kiểu tay",
      description: "Tay dài với chi tiết gấu tay tinh tế",
      priceAdjustment: 100000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/3. T - Loại tay áo/T4 - Tay dài có gấu.png`
      ),
    },
  });

  // Kiểu cổ
  const collarC2 = await prisma.styleOption.create({
    data: {
      name: "Cổ Shawl",
      type: "Kiểu cổ",
      description: "Cổ shawl sang trọng, phù hợp sự kiện",
      priceAdjustment: 200000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/4. C - loại cổ áo/C2 - Cổ shawl.png`
      ),
    },
  });

  const collarC3 = await prisma.styleOption.create({
    data: {
      name: "Cổ tròn",
      type: "Kiểu cổ",
      description: "Cổ tròn đơn giản, thanh lịch",
      priceAdjustment: 0,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/4. C - loại cổ áo/C3 - Cổ tròn.png`
      ),
    },
  });

  // Túi áo
  const pocketYes = await prisma.styleOption.create({
    data: {
      name: "Túi có nắp cài nút",
      type: "Túi áo",
      description: "Túi áo có nắp với nút cài tinh tế",
      priceAdjustment: 100000,
      imageUrl: null,
    },
  });

  const pocketNo = await prisma.styleOption.create({
    data: {
      name: "Không có túi",
      type: "Túi áo",
      description: "Thiết kế không có túi, đơn giản",
      priceAdjustment: 0,
      imageUrl: null,
    },
  });

  // Lót trong
  const liningCupro = await prisma.styleOption.create({
    data: {
      name: "Lót Cupro cao cấp",
      type: "Lót trong",
      description: "Lót Cupro mềm mại, thoáng khí, cao cấp",
      priceAdjustment: 300000,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/L - Lót trong/Lót Cupro Cao Cấp.png`
      ),
    },
  });

  const liningViscose = await prisma.styleOption.create({
    data: {
      name: "Lót Viscose tiêu chuẩn",
      type: "Lót trong",
      description: "Lót Viscose tiêu chuẩn, thoải mái",
      priceAdjustment: 0,
      imageUrl: encodeImagePath(
        `${IMG_BASE}/SP TEST/L - Lót trong/Lót viscose tiêu chuẩn.png`
      ),
    },
  });

  // ========== CREATE PRODUCTS ==========
  console.log("👗 Creating products...");

  // NAM01 - Áo Dài Nam Cổ Điển
  const nam01 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNam.id,
      name: "Áo Dài Nam Cổ Điển",
      description:
        "Áo dài nam truyền thống với thiết kế cổ điển, phù hợp các dịp lễ tết, cưới hỏi. Chất liệu cao cấp, may đo theo số đo riêng.",
      basePrice: 3500000,
      images: [
        encodeImagePath(`${IMG_BASE}/NAM01 - ÁO DÀI/NAM01 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/NAM01 - ÁO DÀI/NAM01 - VÀNG KEM.png`),
        encodeImagePath(`${IMG_BASE}/NAM01 - ÁO DÀI/NAM01 - ĐỎ.png`),
        encodeImagePath(`${IMG_BASE}/NAM01 - ÁO DÀI/NAM01- XANH DƯƠNG ĐẬM.png`),
      ],
      isPublished: true,
      featured: true,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV2.id },
          { id: fabricV5.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: buttonN1.id },
          { id: buttonN2.id },
          { id: sleeveT2.id },
          { id: collarC2.id },
        ],
      },
    },
  });

  // NAM02 - Áo Dài Nam Hiện Đại
  const nam02 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNam.id,
      name: "Áo Dài Nam Hiện Đại",
      description:
        "Áo dài nam với thiết kế hiện đại, trẻ trung hơn. Phù hợp các dịp tiệc, sự kiện.",
      basePrice: 4000000,
      images: [
        encodeImagePath(`${IMG_BASE}/NAM02 - ÁO DÀI/NAM02 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/NAM02 - ÁO DÀI/NAM02 - TRẮNG KEM.png`),
        encodeImagePath(`${IMG_BASE}/NAM02 - ÁO DÀI/NAM02 - XANH DƯƠNG.png`),
        encodeImagePath(`${IMG_BASE}/NAM02 - ÁO DÀI/NAM02 - ĐỎ.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV2.id },
          { id: fabricV6.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: buttonN1.id },
          { id: buttonN3.id },
          { id: sleeveT2.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // NAM03 - Vest 2 Mảnh Classic
  const nam03 = await prisma.product.create({
    data: {
      categoryId: categoryVestNam.id,
      name: "Vest 2 Mảnh Classic",
      description:
        "Vest nam 2 mảnh (áo vest + quần) với thiết kế cổ điển, sang trọng. Phù hợp công sở và các sự kiện quan trọng.",
      basePrice: 5500000,
      images: [
        encodeImagePath(`${IMG_BASE}/NAM03 - ÁO VEST/NAM03 - ĐEN.png`),
        encodeImagePath(`${IMG_BASE}/NAM03 - ÁO VEST/NAM03 - XÁM.png`),
        encodeImagePath(
          `${IMG_BASE}/NAM03 - ÁO VEST/NAM03 - XANH DƯƠNG ĐẬM.png`
        ),
        encodeImagePath(`${IMG_BASE}/NAM03 - ÁO VEST/NAM03 - TRẮNG KEM.png`),
        encodeImagePath(`${IMG_BASE}/NAM03 - ÁO VEST/NAM03 - ĐỎ ĐÔ.png`),
      ],
      isPublished: true,
      featured: true,
      fabrics: {
        connect: [
          { id: fabricV2.id },
          { id: fabricV4.id },
          { id: fabricV6.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: buttonN1.id },
          { id: buttonN2.id },
          { id: buttonN3.id },
          { id: sleeveT2.id },
          { id: collarC2.id },
          { id: pocketYes.id },
          { id: liningCupro.id },
          { id: liningViscose.id },
        ],
      },
    },
  });

  // NAM04 - Vest 3 Mảnh Luxury
  const nam04 = await prisma.product.create({
    data: {
      categoryId: categoryVestNam.id,
      name: "Vest 3 Mảnh Luxury",
      description:
        "Vest nam 3 mảnh (áo vest + quần + áo gile) với thiết kế sang trọng, đẳng cấp. Phù hợp tiệc cưới, sự kiện quan trọng.",
      basePrice: 7500000,
      images: [
        encodeImagePath(`${IMG_BASE}/NAM04 - ÁO VEST/NAM04 - ĐEN.png`),
        encodeImagePath(`${IMG_BASE}/NAM04 - ÁO VEST/NAM04 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/NAM04 - ÁO VEST/NAM04-ĐỎ ĐÔ.png`),
        encodeImagePath(`${IMG_BASE}/NAM04 - ÁO VEST/NAM04-HỒNG.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [{ id: fabricV4.id }, { id: fabricV6.id }],
      },
      styleOptions: {
        connect: [
          { id: buttonN2.id },
          { id: buttonN3.id },
          { id: sleeveT2.id },
          { id: collarC2.id },
          { id: pocketYes.id },
          { id: liningCupro.id },
        ],
      },
    },
  });

  // NAM05 - Áo Dài Nam Premium
  const nam05 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNam.id,
      name: "Áo Dài Nam Premium",
      description:
        "Áo dài nam cao cấp với chất liệu premium, thiết kế tinh xảo. Sản phẩm được may thủ công 100%.",
      basePrice: 5000000,
      images: [
        encodeImagePath(`${IMG_BASE}/NAM05 - ÁO DÀI/NAM05 - XÁM.png`),
        encodeImagePath(`${IMG_BASE}/NAM05 - ÁO DÀI/NAM05 - XANH DƯƠNG.png`),
        encodeImagePath(`${IMG_BASE}/NAM05 - ÁO DÀI/NAM05 - NÂU.png`),
        encodeImagePath(`${IMG_BASE}/NAM05 - ÁO DÀI/NAM05 - VÀNG CAM.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV4.id },
          { id: fabricV5.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: buttonN2.id },
          { id: buttonN3.id },
          { id: sleeveT2.id },
          { id: collarC2.id },
        ],
      },
    },
  });

  // SP01 - Váy Dạ Hội Classic
  const sp01 = await prisma.product.create({
    data: {
      categoryId: categoryVay.id,
      name: "Váy Dạ Hội Classic",
      description:
        "Váy dạ hội với thiết kế cổ điển, sang trọng. Phù hợp các buổi tiệc, sự kiện quan trọng.",
      basePrice: 4500000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP01 - Váy/SP01 - Đen.png`),
        encodeImagePath(`${IMG_BASE}/SP01 - Váy/SP01 - Trắng.png`),
        encodeImagePath(`${IMG_BASE}/SP01 - Váy/SP01 - Xám.png`),
        encodeImagePath(`${IMG_BASE}/SP01 - Váy/SP01 - Xanh dương.png`),
        encodeImagePath(`${IMG_BASE}/SP01 - Váy/SP01 - Hông kem.png`),
      ],
      isPublished: true,
      featured: true,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV5.id },
          { id: fabricV6.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC2.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // SP02 - Váy Công Sở
  const sp02 = await prisma.product.create({
    data: {
      categoryId: categoryVay.id,
      name: "Váy Công Sở",
      description:
        "Váy công sở thanh lịch, chuyên nghiệp. Phù hợp môi trường văn phòng.",
      basePrice: 2800000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP02 - Váy/SP02 - Đen.png`),
        encodeImagePath(`${IMG_BASE}/SP02 - Váy/SP02 - Trắng.png`),
        encodeImagePath(`${IMG_BASE}/SP02 - Váy/SP02 - Hồng.png`),
        encodeImagePath(`${IMG_BASE}/SP02 - Váy/SP02 - Đỏ.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV2.id },
          { id: fabricV3.id },
        ],
      },
      styleOptions: {
        connect: [{ id: sleeveT2.id }, { id: collarC3.id }],
      },
    },
  });

  // SP03 - Áo Dài Nữ Cổ Điển
  const sp03 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNu.id,
      name: "Áo Dài Nữ Cổ Điển",
      description:
        "Áo dài nữ truyền thống với thiết kế cổ điển, tôn dáng. Phù hợp các dịp lễ tết, cưới hỏi.",
      basePrice: 3800000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP03 - Áo dài/SP03 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/SP03 - Áo dài/SP03- HỒNG.png`),
        encodeImagePath(`${IMG_BASE}/SP03 - Áo dài/SP03 - XANH DƯƠNG.png`),
        encodeImagePath(`${IMG_BASE}/SP03 - Áo dài/SP03 - VÀNG.png`),
      ],
      isPublished: true,
      featured: true,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV5.id },
          { id: fabricV3.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC2.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // SP04 - Sườn Xám Truyền Thống
  const sp04 = await prisma.product.create({
    data: {
      categoryId: categorySuonXam.id,
      name: "Sườn Xám Truyền Thống",
      description:
        "Sườn xám truyền thống với họa tiết tinh xảo, tôn dáng người mặc.",
      basePrice: 4200000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP04 - VÁY SƯỜN XÁM/SP04 - ĐỎ.png`),
        encodeImagePath(`${IMG_BASE}/SP04 - VÁY SƯỜN XÁM/SP04 - HÔNG.png`),
        encodeImagePath(`${IMG_BASE}/SP04 - VÁY SƯỜN XÁM/SP05 - KEM.png`),
      ],
      isPublished: true,
      featured: true,
      fabrics: {
        connect: [{ id: fabricV5.id }, { id: fabricV1.id }],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC2.id },
        ],
      },
    },
  });

  // SP05 - Váy Đuôi Cá
  const sp05 = await prisma.product.create({
    data: {
      categoryId: categoryVay.id,
      name: "Váy Đuôi Cá",
      description:
        "Váy đuôi cá quyến rũ, phù hợp các sự kiện sang trọng, tiệc cưới.",
      basePrice: 5500000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP05 - VÁY ĐUÔI CÁ/SP05 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/SP05 - VÁY ĐUÔI CÁ/SP05- TRẮNG KEM.png`),
        encodeImagePath(`${IMG_BASE}/SP05 - VÁY ĐUÔI CÁ/SP05 - ĐEN.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV5.id },
          { id: fabricV6.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT4.id },
          { id: collarC2.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // SP06 - Váy Cocktail
  const sp06 = await prisma.product.create({
    data: {
      categoryId: categoryVay.id,
      name: "Váy Cocktail",
      description:
        "Váy cocktail thanh lịch, phù hợp các buổi tiệc nhỏ, họp mặt.",
      basePrice: 3200000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP06 - VÁY/SP06 - ĐEN.png`),
        encodeImagePath(`${IMG_BASE}/SP06 - VÁY/SP06 - ĐỎ.png`),
        encodeImagePath(`${IMG_BASE}/SP06 - VÁY/SP06 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/SP06 - VÁY/SP06 - DA.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [{ id: fabricV1.id }, { id: fabricV5.id }],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // SP07 - Áo Dài Nữ Hiện Đại
  const sp07 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNu.id,
      name: "Áo Dài Nữ Hiện Đại",
      description:
        "Áo dài nữ với thiết kế hiện đại, trẻ trung. Phù hợp các sự kiện, tiệc.",
      basePrice: 4200000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP07 - ÁO DÀI/SP07 - KEM.png`),
        encodeImagePath(`${IMG_BASE}/SP07 - ÁO DÀI/SP07 - HỒNG.png`),
        encodeImagePath(`${IMG_BASE}/SP07 - ÁO DÀI/SP07 - XANH DƯƠNG.png`),
        encodeImagePath(`${IMG_BASE}/SP07 - ÁO DÀI/SP07 - TÍM.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV3.id },
          { id: fabricV5.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC2.id },
        ],
      },
    },
  });

  // SP08 - Áo Dài Nữ Premium
  const sp08 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNu.id,
      name: "Áo Dài Nữ Premium",
      description:
        "Áo dài nữ cao cấp với chất liệu premium, thiết kế tinh xảo.",
      basePrice: 5500000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP08 - ÁO DÀI/SP08 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/SP08 - ÁO DÀI/SP08 - HỒNG.png`),
        encodeImagePath(`${IMG_BASE}/SP08 - ÁO DÀI/SP08 - VÀNG.png`),
        encodeImagePath(`${IMG_BASE}/SP08 - ÁO DÀI/SP08 - XANH DƯƠNG.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [{ id: fabricV4.id }, { id: fabricV5.id }],
      },
      styleOptions: {
        connect: [{ id: sleeveT2.id }, { id: collarC2.id }],
      },
    },
  });

  // SP09 - Áo Dài Cách Tân
  const sp09 = await prisma.product.create({
    data: {
      categoryId: categoryAoDaiNu.id,
      name: "Áo Dài Cách Tân",
      description:
        "Áo dài cách tân với thiết kế độc đáo, kết hợp truyền thống và hiện đại.",
      basePrice: 4800000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP09 - ÁO DÀI/SP09 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/SP09 - ÁO DÀI/SP09 - TÍM.png`),
        encodeImagePath(`${IMG_BASE}/SP09 - ÁO DÀI/SP09 - XANH LÁ.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV3.id },
          { id: fabricV5.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // SP10 - Váy Maxi
  const sp10 = await prisma.product.create({
    data: {
      categoryId: categoryVay.id,
      name: "Váy Maxi",
      description: "Váy maxi dài, bay bổng. Phù hợp đi biển, dạo phố.",
      basePrice: 2500000,
      images: [
        encodeImagePath(`${IMG_BASE}/SP10 - VÁY/SP10 - TRẮNG.png`),
        encodeImagePath(`${IMG_BASE}/SP10 - VÁY/SP10 - XANH DƯƠNG.png`),
        encodeImagePath(`${IMG_BASE}/SP10 - VÁY/SP10 - HỒNG.png`),
        encodeImagePath(`${IMG_BASE}/SP10 - VÁY/SP10 - TÍM.png`),
      ],
      isPublished: true,
      featured: false,
      fabrics: {
        connect: [{ id: fabricV1.id }, { id: fabricV3.id }],
      },
      styleOptions: {
        connect: [
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: collarC3.id },
        ],
      },
    },
  });

  // ========== SP TEST - SẢN PHẨM DEMO CHÍNH ==========
  // Sản phẩm này có đầy đủ các options và mockup images cho từng combo
  const spTest = await prisma.product.create({
    data: {
      categoryId: categoryVayDemo.id,
      name: "Váy May Đo Cao Cấp",
      description: `Váy may đo cao cấp với nhiều tùy chọn tùy biến:
- 6 loại vải cao cấp: Cotton Ai Cập, Wool Luxury, Linen Premium, Wool Cashmere, Silk Cotton, Mohair Blend
- 3 loại nút áo: Kim loại vàng, Vân sừng, Kim loại premium
- 3 kiểu tay: Dài thông thường, Bồng, Dài có gấu
- 2 kiểu cổ: Shawl, Tròn
- Tùy chọn túi áo và lót trong

Sản phẩm được may thủ công 100%, đảm bảo chất lượng hoàn hảo.`,
      basePrice: 4000000,
      images: [
        // === FABRIC ONLY MOCKUPS (Index 0-5) ===
        encodeImagePath(
          `${IMG_BASE}/SP TEST/1. V - Loại vải/Ảnh Mockup/SP Test - V1.png`
        ), // 0: V1
        encodeImagePath(
          `${IMG_BASE}/SP TEST/1. V - Loại vải/Ảnh Mockup/SP Test - V2.png`
        ), // 1: V2
        encodeImagePath(
          `${IMG_BASE}/SP TEST/1. V - Loại vải/Ảnh Mockup/SP Test - V3.png`
        ), // 2: V3
        encodeImagePath(
          `${IMG_BASE}/SP TEST/1. V - Loại vải/Ảnh Mockup/SP Test - V4.png`
        ), // 3: V4
        encodeImagePath(
          `${IMG_BASE}/SP TEST/1. V - Loại vải/Ảnh Mockup/SP Test - V5.png`
        ), // 4: V5
        encodeImagePath(
          `${IMG_BASE}/SP TEST/1. V - Loại vải/Ảnh Mockup/SP Test - V6.png`
        ), // 5: V6
        // === COMBO MOCKUPS - V1 + NÚT ÁO (Index 6-8) ===
        encodeImagePath(
          `${IMG_BASE}/SP TEST/2. N - Loại nút áo/Ảnh mockup/V1 - N3.png`
        ), // 6: V1-N3
        // === COMBO MOCKUPS - V1 + NÚT ÁO + TAY ÁO (Index 7-9) ===
        encodeImagePath(
          `${IMG_BASE}/SP TEST/3. T - Loại tay áo/Ảnh mockup/V1 - N3 - T4.png`
        ), // 7: V1-N3-T4
        // === COMBO MOCKUPS - V1 + NÚT ÁO + TAY ÁO + CỔ ÁO (Index 8-10) ===
        encodeImagePath(
          `${IMG_BASE}/SP TEST/4. C - loại cổ áo/Ảnh mockup/V1 - N3 - T4 - Cổ shawl.png`
        ), // 8: V1-N3-T4-C2
        // === COMBO MOCKUPS - V1 + NÚT ÁO + TAY ÁO + CỔ ÁO + TÚI ÁO (Full combo) ===
        encodeImagePath(
          `${IMG_BASE}/SP TEST/5. Túi áo/Ảnh mockup/V1 - N3 - T4 - C2 - Túi có nắp nút cài.png`
        ), // 9: V1-N3-T4-C2-pocket
      ],
      isPublished: true,
      featured: true,
      fabrics: {
        connect: [
          { id: fabricV1.id },
          { id: fabricV2.id },
          { id: fabricV3.id },
          { id: fabricV4.id },
          { id: fabricV5.id },
          { id: fabricV6.id },
        ],
      },
      styleOptions: {
        connect: [
          { id: buttonN1.id },
          { id: buttonN2.id },
          { id: buttonN3.id },
          { id: sleeveT2.id },
          { id: sleeveT3.id },
          { id: sleeveT4.id },
          { id: collarC2.id },
          { id: collarC3.id },
          { id: pocketYes.id },
          { id: pocketNo.id },
          { id: liningCupro.id },
          { id: liningViscose.id },
        ],
      },
    },
  });

  // ========== CREATE ORDERS ==========
  console.log("📦 Creating orders...");

  // Order 1: PENDING - customer2 đặt SP TEST
  const order1 = await prisma.order.create({
    data: {
      userId: customer2.id,
      status: OrderStatus.PENDING,
      totalAmount: 5100000, // basePrice + fabric + options
      shippingAddress: {
        street: "789 Đường Trần Hưng Đạo",
        city: "Quận 5",
        country: "Hồ Chí Minh",
      },
      items: {
        create: [
          {
            productId: spTest.id,
            fabricId: fabricV1.id,
            styleOptionId: buttonN1.id,
            quantity: 1,
            priceAtTime: 5100000,
            measurementSnapshot: {
              vai: 38,
              nguc: 88,
              eo: 68,
              mong: 92,
              daiAo: 125,
            },
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.COD,
          status: PaymentStatus.PENDING,
        },
      },
    },
  });

  // Order 2: CONFIRMED - customer1 đặt NAM03, staff1 xác nhận
  const order2 = await prisma.order.create({
    data: {
      userId: customer1.id,
      staffId: staff1.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: 7000000,
      shippingAddress: {
        street: "123 Đường Nguyễn Huệ",
        city: "Quận 1",
        country: "Hồ Chí Minh",
      },
      items: {
        create: [
          {
            productId: nam03.id,
            fabricId: fabricV4.id,
            styleOptionId: buttonN2.id,
            quantity: 1,
            priceAtTime: 7000000,
            measurementSnapshot: {
              vai: 45,
              nguc: 100,
              eo: 85,
              mong: 95,
              daiAo: 75,
              daiTay: 62,
            },
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.SEPAY,
          status: PaymentStatus.SUCCESS,
          transactionId: "TXN-" + Date.now() + "-001",
        },
      },
    },
  });

  // Order 3: IN_PRODUCTION - customer1 đặt SP03, staff2 đang may
  const order3 = await prisma.order.create({
    data: {
      userId: customer1.id,
      staffId: staff2.id,
      status: OrderStatus.IN_PRODUCTION,
      totalAmount: 4600000,
      shippingAddress: {
        street: "123 Đường Nguyễn Huệ",
        city: "Quận 1",
        country: "Hồ Chí Minh",
      },
      items: {
        create: [
          {
            productId: sp03.id,
            fabricId: fabricV5.id,
            styleOptionId: sleeveT3.id,
            quantity: 1,
            priceAtTime: 4600000,
            measurementSnapshot: {
              vai: 38,
              nguc: 88,
              eo: 68,
              daiAo: 130,
              daiTay: 58,
            },
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.COD,
          status: PaymentStatus.PENDING,
        },
      },
    },
  });

  // Order 4: READY_FOR_PICKUP - customer2 đặt SP01
  const order4 = await prisma.order.create({
    data: {
      userId: customer2.id,
      staffId: staff1.id,
      status: OrderStatus.READY_FOR_PICKUP,
      totalAmount: 5500000,
      shippingAddress: {
        street: "789 Đường Trần Hưng Đạo",
        city: "Quận 5",
        country: "Hồ Chí Minh",
      },
      items: {
        create: [
          {
            productId: sp01.id,
            fabricId: fabricV6.id,
            styleOptionId: collarC2.id,
            quantity: 1,
            priceAtTime: 5500000,
            measurementSnapshot: {
              vai: 36,
              nguc: 86,
              eo: 66,
              mong: 90,
            },
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.SEPAY,
          status: PaymentStatus.SUCCESS,
          transactionId: "TXN-" + Date.now() + "-002",
        },
      },
    },
  });

  // Order 5: COMPLETED - customer1 đặt SP TEST + Review
  const order5 = await prisma.order.create({
    data: {
      userId: customer1.id,
      staffId: staff2.id,
      status: OrderStatus.COMPLETED,
      totalAmount: 5800000,
      shippingAddress: {
        street: "456 Đường Lê Lợi",
        city: "Quận 3",
        country: "Hồ Chí Minh",
      },
      items: {
        create: [
          {
            productId: spTest.id,
            fabricId: fabricV2.id,
            styleOptionId: buttonN2.id,
            quantity: 1,
            priceAtTime: 5800000,
            measurementSnapshot: {
              vai: 40,
              nguc: 90,
              eo: 70,
              mong: 95,
              daiAo: 130,
            },
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.COD,
          status: PaymentStatus.SUCCESS,
        },
      },
      review: {
        create: {
          userId: customer1.id,
          productId: spTest.id,
          rating: 5,
          comment:
            "Sản phẩm rất đẹp, chất lượng tuyệt vời! Đường may tinh xảo, vải mềm mại. Rất hài lòng với dịch vụ.",
        },
      },
    },
  });

  // ========== CREATE APPOINTMENTS ==========
  console.log("📅 Creating appointments...");

  const now = new Date();

  // Appointment 1: PENDING - customer2, ngày mai 10:00
  const tomorrow10am = new Date(now);
  tomorrow10am.setDate(tomorrow10am.getDate() + 1);
  tomorrow10am.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      userId: customer2.id,
      status: AppointmentStatus.PENDING,
      startTime: tomorrow10am,
      endTime: new Date(tomorrow10am.getTime() + 60 * 60 * 1000),
      notes: "Muốn tư vấn về váy dạ hội cho tiệc cuối năm",
    },
  });

  // Appointment 2: CONFIRMED - customer1, ngày mai 14:00, staff1
  const tomorrow2pm = new Date(now);
  tomorrow2pm.setDate(tomorrow2pm.getDate() + 1);
  tomorrow2pm.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      userId: customer1.id,
      staffId: staff1.id,
      status: AppointmentStatus.CONFIRMED,
      startTime: tomorrow2pm,
      endTime: new Date(tomorrow2pm.getTime() + 60 * 60 * 1000),
      notes: "Thử vest đã đặt may, điều chỉnh nếu cần",
    },
  });

  // Appointment 3: COMPLETED - customer1, tuần trước
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(9, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      userId: customer1.id,
      staffId: staff2.id,
      status: AppointmentStatus.COMPLETED,
      startTime: lastWeek,
      endTime: new Date(lastWeek.getTime() + 90 * 60 * 1000),
      notes: "Tư vấn và lấy số đo cho áo dài",
    },
  });

  // Appointment 4: CANCELLED - customer2, tuần trước
  const lastWeek2 = new Date(now);
  lastWeek2.setDate(lastWeek2.getDate() - 5);
  lastWeek2.setHours(15, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      userId: customer2.id,
      status: AppointmentStatus.CANCELLED,
      startTime: lastWeek2,
      endTime: new Date(lastWeek2.getTime() + 60 * 60 * 1000),
      notes: "Khách hàng có việc đột xuất, hẹn lại sau",
    },
  });

  // ========== SUMMARY ==========
  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Categories: ${await prisma.category.count()}`);
  console.log(`- Products: ${await prisma.product.count()}`);
  console.log(`- Fabrics: ${await prisma.fabric.count()}`);
  console.log(`- Style Options: ${await prisma.styleOption.count()}`);
  console.log(`- Orders: ${await prisma.order.count()}`);
  console.log(`- Appointments: ${await prisma.appointment.count()}`);
  console.log(`- Reviews: ${await prisma.review.count()}`);

  console.log("\n🔑 Test Accounts:");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│ Role     │ Email                      │ Password       │");
  console.log("├─────────────────────────────────────────────────────────┤");
  console.log("│ ADMIN    │ admin@customtailor.com     │ password123    │");
  console.log("│ STAFF    │ staff1@customtailor.com    │ password123    │");
  console.log("│ STAFF    │ staff2@customtailor.com    │ password123    │");
  console.log("│ CUSTOMER │ customer1@example.com      │ password123    │");
  console.log("│ CUSTOMER │ customer2@example.com      │ password123    │");
  console.log("└─────────────────────────────────────────────────────────┘");

  console.log("\n🎯 Demo Product:");
  console.log(
    '- "Váy May Đo Cao Cấp" (SP TEST) - Sản phẩm demo chính với đầy đủ options'
  );
  console.log("- Hỗ trợ thay đổi mockup theo từng tùy chọn vải/style");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
