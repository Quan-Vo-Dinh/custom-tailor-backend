import { Module } from "@nestjs/common"
import { PrismaModule } from "@/prisma/prisma.module"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { ProfileService } from "./services/profile.service"
import { AddressService } from "./services/address.service"
import { MeasurementService } from "./services/measurement.service"

@Module({
  imports: [PrismaModule],
  providers: [UsersService, ProfileService, AddressService, MeasurementService],
  controllers: [UsersController],
  exports: [UsersService, ProfileService, AddressService, MeasurementService],
})
export class UsersModule {}
