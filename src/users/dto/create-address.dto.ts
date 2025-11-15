import { IsString, IsBoolean, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateAddressDto {
  @ApiProperty({ example: "123 Main Street" })
  @IsString()
  street: string

  @ApiProperty({ example: "Ho Chi Minh City" })
  @IsString()
  city: string

  @ApiProperty({ example: "Vietnam" })
  @IsString()
  country: string

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
