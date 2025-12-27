import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { OrderItemsService } from "./services/order-items.service";
import { PaymentService } from "./services/payment.service";
import { ReviewService } from "./services/review.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private orderItemsService: OrderItemsService,
    private paymentService: PaymentService,
    private reviewService: ReviewService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new order",
    description:
      "Place a new custom tailoring order with product, fabric, and style options",
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: "Order created successfully",
    schema: {
      example: {
        id: "ord_123",
        customerId: "user_123",
        totalAmount: 2500000,
        status: "PENDING",
        items: [],
        createdAt: "2025-11-12T10:00:00.000Z",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: "Get orders for current user",
    description: "Retrieve paginated list of orders for the authenticated user",
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
    example: 10,
  })
  @ApiResponse({ status: 200, description: "List of user orders" })
  async getOrders(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @CurrentUser() user?: any
  ) {
    return this.ordersService.getOrdersByUserId(
      user.id,
      Number.parseInt(skip) || 0,
      Number.parseInt(take) || 10
    );
  }

  @Get(":orderId")
  @ApiOperation({
    summary: "Get order details",
    description: "Retrieve detailed information about a specific order",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({
    status: 200,
    description: "Order details with items, payment, and review",
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not your order" })
  async getOrderById(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    return this.ordersService.getOrderById(orderId, user.id, user.role);
  }

  @Put(":orderId/cancel")
  @ApiOperation({
    summary: "Cancel order",
    description:
      "Cancel an order (only allowed for PENDING or CONFIRMED status)",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @ApiResponse({ status: 400, description: "Order cannot be cancelled" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async cancelOrder(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    return this.ordersService.cancelOrder(orderId, user.id);
  }

  // Admin/Staff endpoints
  @Get("admin/all")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get all orders (Admin/Staff only)",
    description:
      "Retrieve all orders with optional filters for status and assigned staff",
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
    example: 10,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by order status",
    example: "IN_PRODUCTION",
  })
  @ApiQuery({
    name: "staffId",
    required: false,
    description: "Filter by assigned staff ID",
  })
  @ApiResponse({ status: 200, description: "List of all orders" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getAllOrders(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("status") status?: string,
    @Query("staffId") staffId?: string
  ) {
    return this.ordersService.getAllOrders(
      Number.parseInt(skip) || 0,
      Number.parseInt(take) || 10,
      status as any,
      staffId
    );
  }

  @Get("admin/:orderId")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get order details (Admin/Staff)",
    description: "Retrieve detailed information about a specific order for admin/staff",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({ status: 200, description: "Order details" })
  async getOrderByIdAdmin(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    return this.ordersService.getOrderById(orderId, undefined, user.role);
  }

  @Put(":orderId/status")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Update order status (Admin/Staff only)",
    description:
      "Update order status through production workflow (PENDING → CONFIRMED → IN_PRODUCTION → DELIVERED)",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async updateOrderStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto, user.id);
  }

  @Patch(":orderId/assign-staff/:staffId")
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Assign order to staff (Admin only)",
    description: "Assign a staff member to handle an order",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiParam({
    name: "staffId",
    description: "Staff User ID",
    example: "staff_123",
  })
  @ApiResponse({
    status: 200,
    description: "Order assigned to staff successfully",
  })
  @ApiResponse({ status: 404, description: "Order or Staff not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async assignOrderToStaff(
    @Param("orderId") orderId: string,
    @Param("staffId") staffId: string,
    @CurrentUser() user: any
  ) {
    return this.ordersService.assignOrderToStaff(orderId, staffId);
  }

  // Review endpoints
  @Post(":orderId/reviews")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create review for completed order",
    description: "Leave a rating and comment for a delivered order",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: "Review created successfully" })
  @ApiResponse({
    status: 400,
    description: "Order not delivered or already reviewed",
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  async createReview(
    @Param("orderId") orderId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: any
  ) {
    return this.reviewService.createReview(user.id, orderId, dto);
  }

  @Get(":orderId/reviews")
  @ApiOperation({
    summary: "Get review for order",
    description: "Retrieve review information for a specific order",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({ status: 200, description: "Review details" })
  @ApiResponse({ status: 404, description: "Review not found" })
  async getReviewByOrderId(@Param("orderId") orderId: string) {
    return this.reviewService.getReviewByOrderId(orderId);
  }

  @Put("reviews/:reviewId")
  @ApiOperation({
    summary: "Update review",
    description: "Update an existing review rating or comment",
  })
  @ApiParam({ name: "reviewId", description: "Review ID", example: "rev_123" })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 200, description: "Review updated successfully" })
  @ApiResponse({ status: 404, description: "Review not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not your review" })
  async updateReview(
    @Param("reviewId") reviewId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: any
  ) {
    return this.reviewService.updateReview(reviewId, user.id, dto);
  }

  @Delete("reviews/:reviewId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete review",
    description: "Remove a review from an order",
  })
  @ApiParam({ name: "reviewId", description: "Review ID", example: "rev_123" })
  @ApiResponse({ status: 204, description: "Review deleted successfully" })
  @ApiResponse({ status: 404, description: "Review not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not your review" })
  async deleteReview(
    @Param("reviewId") reviewId: string,
    @CurrentUser() user: any
  ) {
    return this.reviewService.deleteReview(reviewId, user.id);
  }

  // Payment endpoints
  @Get(":orderId/payment")
  @ApiOperation({
    summary: "Get payment details",
    description: "Retrieve payment information for a specific order",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({
    status: 200,
    description: "Payment details",
    schema: {
      example: {
        id: "pay_123",
        orderId: "ord_123",
        amount: 2500000,
        method: "COD",
        status: "PENDING",
        createdAt: "2025-11-12T10:00:00.000Z",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Payment or Order not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not your order" })
  async getPaymentByOrderId(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    // Verify authorization
    await this.ordersService.getOrderById(orderId, user.id);
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Post(":orderId/payment/confirm-cod")
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Confirm COD payment (Admin only)",
    description: "Mark a Cash on Delivery payment as completed",
  })
  @ApiParam({ name: "orderId", description: "Order ID", example: "ord_123" })
  @ApiResponse({ status: 200, description: "COD payment confirmed" })
  @ApiResponse({ status: 404, description: "Payment or Order not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async confirmCODPayment(@Param("orderId") orderId: string) {
    return this.paymentService.confirmCODPayment(orderId);
  }

  @Post("payment/webhook")
  @ApiOperation({
    summary: "Payment webhook from Sepay",
    description: "Webhook endpoint for Sepay payment gateway notifications",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        status: { type: "string" },
        transactionId: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  async handlePaymentWebhook(@Body() data: any) {
    return this.paymentService.handlePaymentWebhook(data);
  }
}
