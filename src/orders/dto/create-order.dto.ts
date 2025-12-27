import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import type { PaymentMethod } from "@prisma/client";

export class OrderItemDto {
  @ApiProperty({ example: "product-uuid" })
  @IsString()
  productId: string;

  @ApiProperty({ example: "fabric-uuid" })
  @IsString()
  fabricId: string;

  @ApiProperty({ example: "style-option-uuid", required: false })
  @IsOptional()
  @IsString()
  styleOptionId?: string;

  @ApiProperty({
    example: ["style-option-uuid-1", "style-option-uuid-2"],
    required: false,
    description: "Array of style option IDs (Nút áo, Kiểu tay, Kiểu cổ, etc.)",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styleOptionIds?: string[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: "measurement-uuid", required: false })
  @IsOptional()
  @IsString()
  measurementId?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    example: [
      {
        productId: "product-uuid",
        fabricId: "fabric-uuid",
        styleOptionId: "style-option-uuid",
        quantity: 1,
        measurementId: "measurement-uuid",
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: "COD", enum: ["COD", "SEPAY"] })
  @IsString()
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: "address-id", required: false })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiProperty({ example: "measurement-id", required: false })
  @IsOptional()
  @IsString()
  measurementId?: string;

  @ApiProperty({ example: "Ghi chú đơn hàng", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
