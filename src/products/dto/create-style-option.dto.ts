import { IsString, IsNumber, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CreateStyleOptionDto {
  @ApiProperty({ example: "Cổ Đức" })
  @IsString()
  name: string

  @ApiProperty({ example: "Cổ áo" })
  @IsString()
  type: string

  @ApiProperty({ example: 20000 })
  @IsNumber()
  @Type(() => Number)
  priceAdjustment: number

  @ApiProperty({ example: "https://...", required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string
}
