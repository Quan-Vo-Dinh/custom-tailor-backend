import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { NotificationsService } from "@/notifications/notifications.service";
import { OrderStatus, Role } from "@prisma/client";
import type { CreateOrderDto } from "./dto/create-order.dto";
import type { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { Decimal } from "decimal.js";

@Injectable()
export class OrdersService {
  private logger = new Logger("OrdersService");

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  /**
   * Create a new order with items, payment, and snapshots
   * Uses database transaction to ensure atomicity
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    // Verify user and get addresses
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true, profile: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const defaultAddress = user.addresses.find((a) => a.isDefault);
    const providedAddress = dto.addressId
      ? user.addresses.find((a) => a.id === dto.addressId)
      : undefined;

    const shippingAddress = providedAddress || defaultAddress;

    if (!shippingAddress) {
      throw new BadRequestException("User must have an address");
    }

    let totalAmount = 0;
    const itemsData: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const fabric = await this.prisma.fabric.findUnique({
        where: { id: item.fabricId },
      });

      if (!fabric) {
        throw new NotFoundException(`Fabric ${item.fabricId} not found`);
      }

      let styleOption = null;
      let styleOptionsTotal = 0;
      const styleOptionIds: string[] = [];

      // Support both single styleOptionId and array styleOptionIds
      const allStyleOptionIds =
        item.styleOptionIds || (item.styleOptionId ? [item.styleOptionId] : []);

      for (const styleId of allStyleOptionIds) {
        const style = await this.prisma.styleOption.findUnique({
          where: { id: styleId },
        });

        if (!style) {
          throw new NotFoundException(`StyleOption ${styleId} not found`);
        }

        styleOptionsTotal += style.priceAdjustment.toNumber();
        styleOptionIds.push(styleId);

        // Keep first style as the main styleOption for backward compatibility
        if (!styleOption) {
          styleOption = style;
        }
      }

      // Get measurement snapshot
      let measurementSnapshot: Record<string, number> | undefined;

      const measurementId = item.measurementId || dto.measurementId;
      if (measurementId) {
        const measurement = await this.prisma.measurement.findUnique({
          where: { id: measurementId },
        });

        if (!measurement || measurement.userId !== userId) {
          throw new ForbiddenException("Measurement not found or unauthorized");
        }

        measurementSnapshot = measurement.details as Record<string, number>;
      }

      if (!measurementSnapshot) {
        throw new BadRequestException("Measurement is required for order item");
      }

      // Calculate price - sum of basePrice + fabric + ALL style options
      const priceAtTime =
        (product.basePrice.toNumber() +
          fabric.priceAdjustment.toNumber() +
          styleOptionsTotal) *
        item.quantity;

      totalAmount += priceAtTime;

      itemsData.push({
        productId: item.productId,
        fabricId: item.fabricId,
        styleOptionId: styleOption?.id || null, // Store first style for DB relation
        quantity: item.quantity,
        priceAtTime: new Decimal(priceAtTime),
        measurementSnapshot: {
          ...measurementSnapshot,
          // Store all selected style option IDs for reference
          _styleOptionIds: styleOptionIds,
        },
      });
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount: new Decimal(totalAmount),
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            country: shippingAddress.country,
          },
          items: {
            createMany: {
              data: itemsData,
            },
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              status: "PENDING",
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
              fabric: true,
              styleOption: true,
            },
          },
          payment: true,
          customer: {
            include: {
              profile: true,
            },
          },
        },
      });

      return newOrder;
    });

    // Send confirmation email
    try {
      const customerEmail = user.email;
      const customerName = user.profile?.fullName || "Quý khách";

      await this.notificationsService.sendOrderConfirmedEmail(customerEmail, {
        orderId: order.id,
        customerName,
        totalAmount: order.totalAmount.toNumber(),
        items: order.items.map((item: any) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.priceAtTime.toNumber(),
        })),
      });

      this.logger.log(`Order confirmation email sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email: ${(error as Error).message}`
      );
      // Don't throw - order was created successfully
    }

    return order;
  }

  /**
   * Get orders for current user
   */
  async getOrdersByUserId(userId: string, skip = 0, take = 10) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      skip,
      take,
      include: {
        items: {
          include: {
            product: true,
            fabric: true,
            styleOption: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await this.prisma.order.count({ where: { userId } });

    return { data: orders, total, skip, take };
  }

  /**
   * Get single order by ID (with authorization check)
   */
  async getOrderById(orderId: string, userId?: string, role?: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { profile: true } },
        staff: { include: { profile: true } },
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

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Authorization:
    // - Customers can only view their own orders
    // - Staff/Admin can view any order
    if (role !== "ADMIN" && role !== "STAFF") {
      if (userId && order.userId !== userId) {
        throw new ForbiddenException("Not authorized to view this order");
      }
    }

    return order;
  }

  /**
   * Get all orders (Admin/Staff only)
   */
  async getAllOrders(
    skip = 0,
    take = 10,
    status?: OrderStatus,
    staffId?: string
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (staffId) {
      where.staffId = staffId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take,
      include: {
        customer: { include: { profile: true } },
        staff: { include: { profile: true } },
        items: {
          include: {
            product: true,
            fabric: true,
            styleOption: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await this.prisma.order.count({ where });

    return { data: orders, total, skip, take };
  }

  /**
   * Update order status (State Machine)
   */
  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    adminId?: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Validate state transitions
    this.validateStatusTransition(order.status, dto.status);

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
      },
      include: {
        customer: { include: { profile: true } },
        items: true,
        payment: true,
      },
    });

    // Send status update email
    try {
      const customerEmail = updatedOrder.customer.email;
      const customerName =
        updatedOrder.customer.profile?.fullName || "Quý khách";

      await this.notificationsService.sendOrderStatusUpdateEmail(
        customerEmail,
        {
          orderId: updatedOrder.id,
          customerName,
          status: dto.status,
          updatedAt: new Date().toISOString(),
        }
      );

      this.logger.log(
        `Order status update email sent for order ${updatedOrder.id}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send order status update email: ${(error as Error).message}`
      );
      // Don't throw - order was updated successfully
    }

    return updatedOrder;
  }

  /**
   * Assign order to staff
   */
  async assignOrderToStaff(orderId: string, staffId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Verify staff exists and has STAFF role
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff || staff.role !== "STAFF") {
      throw new BadRequestException("Invalid staff ID");
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { staffId },
      include: {
        staff: { include: { profile: true } },
        items: true,
      },
    });

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Customers can only cancel their own orders
    if (userId && order.userId !== userId) {
      throw new ForbiddenException("Not authorized to cancel this order");
    }

    // Cannot cancel if already shipped or completed
    if (
      order.status === OrderStatus.SHIPPING ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        "Cannot cancel order that is already shipped or completed"
      );
    }

    const cancelledOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: true,
        payment: true,
      },
    });

    return cancelledOrder;
  }

  /**
   * Validate order status transitions
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.IN_PRODUCTION,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.IN_PRODUCTION]: [
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.SHIPPING],
      [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
