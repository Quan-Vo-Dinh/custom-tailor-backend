import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CreateProductDto {
  @ApiProperty({ example: "category-uuid" })
  @IsUUID()
  categoryId: string

  @ApiProperty({ example: "Áo Vest Premium" })
  @IsString()
  name: string

  @ApiProperty({ example: "Áo vest cao cấp với thiết kế đơn giản", required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Type(() => Number)
  basePrice: number

  @ApiProperty({ example: ["https://...", "https://..."], required: false })
  @IsOptional()
  @IsArray()
  images?: string[]

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean
}
