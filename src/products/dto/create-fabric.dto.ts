import { IsString, IsOptional, IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CreateFabricDto {
  @ApiProperty({ example: "Lụa Tơ Tằm" })
  @IsString()
  name: string

  @ApiProperty({ example: "https://...", required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Type(() => Number)
  priceAdjustment: number
}
