import { Module } from "@nestjs/common";
import { PrismaModule } from "@/prisma/prisma.module";
import { UsersModule } from "@/users/users.module";
import { ProductsModule } from "@/products/products.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { OrdersService } from "./orders.service";
import "./services/order-items.service";
import "./services/payment.service";
import "./services/review.service";
import { OrdersController } from "./orders.controller";
import { OrderItemsService } from "./services/order-items.service";
import { PaymentService } from "./services/payment.service";
import { ReviewService } from "./services/review.service";

@Module({
  imports: [PrismaModule, UsersModule, ProductsModule, NotificationsModule],
  providers: [OrdersService, OrderItemsService, PaymentService, ReviewService],
  controllers: [OrdersController],
  exports: [OrdersService, OrderItemsService, PaymentService, ReviewService],
})
export class OrdersModule {}
