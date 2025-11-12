import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { OrderConfirmedEmail } from "./templates/order-confirmed.email";
import { OrderStatusUpdateEmail } from "./templates/order-status-update.email";
import { AppointmentConfirmedEmail } from "./templates/appointment-confirmed.email";
import { AppointmentCancelledEmail } from "./templates/appointment-cancelled.email";

@Injectable()
export class NotificationsService {
  private resend: Resend;
  private logger = new Logger("NotificationsService");

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOrderConfirmedEmail(
    customerEmail: string,
    orderData: {
      orderId: string;
      customerName: string;
      totalAmount: number;
      items: Array<{ productName: string; quantity: number; price: number }>;
    }
  ) {
    try {
      const result = await this.resend.emails.send({
        from: "orders@custom-tailor.com",
        to: customerEmail,
        subject: `Order Confirmed - #${orderData.orderId}`,
        react: OrderConfirmedEmail(orderData),
      });

      this.logger.log(`Order confirmed email sent to ${customerEmail}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmed email: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendOrderStatusUpdateEmail(
    customerEmail: string,
    orderData: {
      orderId: string;
      customerName: string;
      status: string;
      updatedAt: string;
    }
  ) {
    try {
      const result = await this.resend.emails.send({
        from: "orders@custom-tailor.com",
        to: customerEmail,
        subject: `Order Status Update - #${orderData.orderId}`,
        react: OrderStatusUpdateEmail(orderData),
      });

      this.logger.log(`Order status update email sent to ${customerEmail}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send order status update email: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendAppointmentConfirmedEmail(
    customerEmail: string,
    appointmentData: {
      appointmentId: string;
      customerName: string;
      startTime: string;
      endTime: string;
    }
  ) {
    try {
      const result = await this.resend.emails.send({
        from: "appointments@custom-tailor.com",
        to: customerEmail,
        subject: "Appointment Confirmed",
        react: AppointmentConfirmedEmail(appointmentData),
      });

      this.logger.log(`Appointment confirmed email sent to ${customerEmail}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmed email: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendAppointmentCancelledEmail(
    customerEmail: string,
    appointmentData: {
      appointmentId: string;
      customerName: string;
      startTime: string;
    }
  ) {
    try {
      const result = await this.resend.emails.send({
        from: "appointments@custom-tailor.com",
        to: customerEmail,
        subject: "Appointment Cancelled",
        react: AppointmentCancelledEmail(appointmentData),
      });

      this.logger.log(`Appointment cancelled email sent to ${customerEmail}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send appointment cancelled email: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
