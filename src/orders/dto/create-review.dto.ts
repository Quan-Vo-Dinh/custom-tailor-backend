import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateReviewDto {
  @ApiProperty({ example: "product-uuid" })
  @IsUUID()
  productId: string

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty({ example: "Great product!", required: false })
  @IsOptional()
  @IsString()
  comment?: string
}
