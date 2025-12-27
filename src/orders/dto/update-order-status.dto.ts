import { IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { OrderStatus } from "@prisma/client"

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: "CONFIRMED",
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus
}
