import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { AdminService } from "./admin.service";
import { Role } from "@prisma/client";

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("dashboard")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get dashboard statistics",
    description:
      "Retrieve overview statistics (orders, revenue, appointments, customers)",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics",
    schema: {
      example: {
        totalOrders: 150,
        totalRevenue: 375000000,
        pendingOrders: 12,
        completedOrders: 138,
        totalAppointments: 85,
        totalCustomers: 120,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getDashboard(@CurrentUser() user: { id: string; role: Role }) {
    return await this.adminService.getDashboardStats(user.id, user.role);
  }

  @Get("orders/recent")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get recent orders",
    description: "Retrieve most recent orders for admin dashboard",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of orders to return",
    example: 10,
  })
  @ApiResponse({ status: 200, description: "List of recent orders" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getRecentOrders(
    @Query("limit") limit?: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getRecentOrders(
      user.id,
      user.role,
      limit ? Number.parseInt(limit) : 10
    );
  }

  @Get("appointments/recent")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get recent appointments",
    description: "Retrieve most recent appointments for admin dashboard",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of appointments to return",
    example: 10,
  })
  @ApiResponse({ status: 200, description: "List of recent appointments" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getRecentAppointments(
    @Query("limit") limit?: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getRecentAppointments(
      user.id,
      user.role,
      limit ? Number.parseInt(limit) : 10
    );
  }

  @Get("revenue")
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get revenue report",
    description: "Retrieve revenue statistics within a date range",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    description: "Start date",
    example: "2025-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    description: "End date",
    example: "2025-12-31",
  })
  @ApiResponse({
    status: 200,
    description: "Revenue report",
    schema: {
      example: {
        totalRevenue: 375000000,
        ordersCount: 150,
        averageOrderValue: 2500000,
        dailyRevenue: [],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getRevenue(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getRevenueReport(
      user.id,
      user.role,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("staff")
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get staff members",
    description: "Retrieve list of all staff members",
  })
  @ApiResponse({
    status: 200,
    description: "List of staff members",
    schema: {
      example: [
        {
          id: "staff_123",
          email: "staff@example.com",
          fullName: "John Staff",
          role: "STAFF",
          createdAt: "2025-11-12T10:00:00.000Z",
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getStaffMembers(
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getStaffMembers(user.id, user.role);
  }

  @Get("staff/workload")
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get staff workload",
    description:
      "Retrieve workload statistics for each staff member (orders and appointments assigned)",
  })
  @ApiResponse({
    status: 200,
    description: "Staff workload statistics",
    schema: {
      example: [
        {
          staffId: "staff_123",
          fullName: "John Staff",
          assignedOrders: 15,
          assignedAppointments: 8,
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getStaffWorkload(
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getStaffWorkload(user.id, user.role);
  }

  @Get("customers")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get customers",
    description:
      "Retrieve paginated list of customers with their order statistics",
  })
  @ApiQuery({
    name: "skip",
    required: false,
    description: "Number of records to skip",
    example: 0,
  })
  @ApiQuery({
    name: "take",
    required: false,
    description: "Number of records to take",
    example: 20,
  })
  @ApiResponse({ status: 200, description: "List of customers" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getCustomers(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getCustomers(
      user.id,
      user.role,
      skip ? Number.parseInt(skip) : 0,
      take ? Number.parseInt(take) : 20
    );
  }

  @Get("orders/:orderId")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get order details (Admin view)",
    description:
      "Retrieve comprehensive order details including customer, items, and production status",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({ status: 200, description: "Detailed order information" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getOrderDetails(
    @Param("orderId") orderId: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getOrderDetails(user.id, user.role, orderId);
  }

  @Get("top-products")
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get top products by revenue",
    description: "Retrieve top selling products by revenue",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of products to return",
    example: 5,
  })
  @ApiResponse({ status: 200, description: "List of top products" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getTopProducts(
    @Query("limit") limit?: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getTopProducts(
      user.id,
      user.role,
      limit ? Number.parseInt(limit) : 5
    );
  }

  @Get("activities")
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get recent activities",
    description: "Retrieve recent orders and appointments for dashboard",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of activities to return",
    example: 10,
  })
  @ApiResponse({ status: 200, description: "List of recent activities" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getRecentActivities(
    @Query("limit") limit?: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getRecentActivities(
      user.id,
      user.role,
      limit ? Number.parseInt(limit) : 10
    );
  }

  @Get("revenue/chart")
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get revenue chart data",
    description: "Retrieve revenue data for chart visualization (last N days)",
  })
  @ApiQuery({
    name: "days",
    required: false,
    description: "Number of days to retrieve",
    example: 7,
  })
  @ApiResponse({ status: 200, description: "Revenue chart data" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getRevenueChartData(
    @Query("days") days?: string,
    @CurrentUser() user: { id: string; role: Role } = {} as any
  ) {
    return await this.adminService.getRevenueChartData(
      user.id,
      user.role,
      days ? Number.parseInt(days) : 7
    );
  }
}
