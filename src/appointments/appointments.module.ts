import { Module } from "@nestjs/common";
import { PrismaModule } from "@/prisma/prisma.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { CacheModule } from "@/cache/cache.module";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";
import { SlotsService } from "./services/slots.service";

@Module({
  imports: [PrismaModule, NotificationsModule, CacheModule],
  providers: [AppointmentsService, SlotsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService, SlotsService],
})
export class AppointmentsModule {}
