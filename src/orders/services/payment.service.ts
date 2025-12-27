import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { PaymentStatus } from "@prisma/client"

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    return payment
  }

  /**
   * Update payment status after successful payment from gateway
   */
  async updatePaymentStatus(orderId: string, transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId,
      },
    })

    // Also update order status to CONFIRMED
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
      },
    })

    return updatedPayment
  }

  /**
   * Confirm COD payment (by Admin)
   */
  async confirmCODPayment(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    if (payment.method !== "COD") {
      throw new BadRequestException("This payment is not COD")
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.SUCCESS,
      },
    })

    // Update order status to CONFIRMED
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
      },
    })

    return updatedPayment
  }

  /**
   * Handle payment webhook from Sepay
   */
  async handlePaymentWebhook(data: any) {
    // TODO: Verify webhook signature
    const { transactionId, orderId, status } = data

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    if (status === "SUCCESS") {
      return this.updatePaymentStatus(orderId, transactionId)
    }

    if (status === "FAILED") {
      await this.prisma.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.FAILED,
        },
      })
    }

    return payment
  }
}
