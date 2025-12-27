import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import type { Role } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard statistics
  async getDashboardStats(userId: string, role: Role) {
    // Allow both ADMIN and STAFF. For STAFF, limit stats to items assigned to them.
    const isStaff = role === "STAFF";

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      totalRevenue,
      totalCustomers,
      totalAppointments,
      pendingAppointments,
    ] = await Promise.all([
      isStaff
        ? this.prisma.order.count({ where: { staffId: userId } })
        : this.prisma.order.count(),
      isStaff
        ? this.prisma.order.count({
            where: { staffId: userId, status: "PENDING" },
          })
        : this.prisma.order.count({ where: { status: "PENDING" } }),
      isStaff
        ? this.prisma.order.count({
            where: { staffId: userId, status: "CONFIRMED" },
          })
        : this.prisma.order.count({ where: { status: "CONFIRMED" } }),
      isStaff
        ? this.prisma.order.count({
            where: { staffId: userId, status: "COMPLETED" },
          })
        : this.prisma.order.count({ where: { status: "COMPLETED" } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: isStaff
          ? { status: "COMPLETED", staffId: userId }
          : { status: "COMPLETED" },
      }),
      // Customers count remains global (both admin and staff can see total customers)
      this.prisma.user.count({ where: { role: "CUSTOMER" } }),
      isStaff
        ? this.prisma.appointment.count({ where: { staffId: userId } })
        : this.prisma.appointment.count(),
      isStaff
        ? this.prisma.appointment.count({
            where: { staffId: userId, status: "PENDING" },
          })
        : this.prisma.appointment.count({ where: { status: "PENDING" } }),
    ]);

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
      },
      customers: {
        total: totalCustomers,
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
      },
    };
  }

  // Get recent orders
  async getRecentOrders(userId: string, role: Role, limit = 10) {
    // Allow STAFF to see recent orders assigned to them
    const where = role === "STAFF" ? { staffId: userId } : undefined;

    return await this.prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        payment: true,
      },
    });
  }

  // Get recent appointments
  async getRecentAppointments(userId: string, role: Role, limit = 10) {
    // Allow STAFF to see appointments assigned to them
    const where = role === "STAFF" ? { staffId: userId } : undefined;

    return await this.prisma.appointment.findMany({
      where,
      take: limit,
      orderBy: { startTime: "desc" },
      include: {
        user: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
      },
    });
  }

  // Revenue report by date range
  async getRevenueReport(
    userId: string,
    role: Role,
    startDate: Date,
    endDate: Date
  ) {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this");
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const groupedByDate: Record<string, number> = {};
    let totalRevenue = 0;

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const amount = Number(order.totalAmount);
      groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + amount;
      totalRevenue += amount;
    });

    return {
      totalRevenue,
      byDate: groupedByDate,
      orderCount: orders.length,
    };
  }

  // Get all staff members
  async getStaffMembers(userId: string, role: Role) {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this");
    }

    return await this.prisma.user.findMany({
      where: { role: "STAFF" },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            fullName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            appointmentsAsStaff: true,
            ordersAsStaff: true,
          },
        },
      },
    });
  }

  // Get staff workload (assignments)
  async getStaffWorkload(userId: string, role: Role) {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this");
    }

    const staffMembers = await this.prisma.user.findMany({
      where: { role: "STAFF" },
      include: {
        profile: true,
        appointmentsAsStaff: {
          where: {
            NOT: { status: "CANCELLED" },
            endTime: { gte: new Date() }, // Future appointments only
          },
        },
        ordersAsStaff: {
          where: {
            NOT: { status: "COMPLETED" },
          },
        },
      },
    });

    return staffMembers.map((staff) => ({
      id: staff.id,
      email: staff.email,
      profile: staff.profile,
      activeAppointments: staff.appointmentsAsStaff.length,
      activeOrders: staff.ordersAsStaff.length,
      totalLoad: staff.appointmentsAsStaff.length + staff.ordersAsStaff.length,
    }));
  }

  // Get customers list
  async getCustomers(userId: string, role: Role, skip = 0, take = 20) {
    // Controller allows both ADMIN and STAFF. For now, allow STAFF to view customers
    // (could be restricted to customers relevant to the staff in a later iteration)
    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: "CUSTOMER" },
        skip,
        take,
        include: {
          profile: true,
          _count: {
            select: {
              ordersAsCustomer: true,
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    return {
      data: customers,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  // Get order details (admin view)
  async getOrderDetails(userId: string, role: Role, orderId: string) {
    // ADMIN can see any order. STAFF can see only orders assigned to them.
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
        items: {
          include: {
            product: true,
            fabric: true,
            styleOption: true,
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!order) return null;

    if (role === "STAFF" && order.staffId !== userId) {
      throw new ForbiddenException(
        "Staff can only view orders assigned to them"
      );
    }

    return order;
  }

  // Get top products by revenue
  async getTopProducts(userId: string, role: Role, limit = 5) {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this");
    }

    const topProducts = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: "COMPLETED",
        },
      },
      _sum: {
        priceAtTime: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          priceAtTime: "desc",
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        basePrice: true,
      },
    });

    return topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        name: product?.name || "Unknown",
        count: item._count.id,
        revenue: Number(item._sum.priceAtTime || 0),
      };
    });
  }

  // Get recent activities for dashboard
  async getRecentActivities(userId: string, role: Role, limit = 10) {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this");
    }

    const [recentOrders, recentAppointments] = await Promise.all([
      this.prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            include: {
              profile: { select: { fullName: true } },
            },
          },
        },
      }),
      this.prisma.appointment.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            include: {
              profile: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    const activities = [
      ...recentOrders.map((order) => ({
        id: order.id,
        type: "order_created",
        message: `Đơn hàng #${order.id} được tạo`,
        user: order.customer.profile?.fullName || order.customer.email,
        timestamp: order.createdAt,
      })),
      ...recentAppointments.map((apt) => ({
        id: apt.id,
        type: "appointment_booked",
        message: `Lịch hẹn mới được đặt`,
        user: apt.user.profile?.fullName || apt.user.email,
        timestamp: apt.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return activities;
  }

  // Get revenue chart data (last N days)
  async getRevenueChartData(userId: string, role: Role, days = 7) {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Group by date
    const revenueByDate: Record<string, number> = {};
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const amount = Number(order.totalAmount);
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + amount;
    });

    // Format for frontend
    return Object.entries(revenueByDate).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      amount,
    }));
  }
}
