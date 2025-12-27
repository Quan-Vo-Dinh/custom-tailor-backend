import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async getOrderItemById(orderItemId: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        product: true,
        fabric: true,
        styleOption: true,
      },
    })

    if (!orderItem) {
      throw new NotFoundException("Order item not found")
    }

    return orderItem
  }

  async getOrderItemsByOrderId(orderId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true,
        fabric: true,
        styleOption: true,
      },
    })

    return orderItems
  }
}
