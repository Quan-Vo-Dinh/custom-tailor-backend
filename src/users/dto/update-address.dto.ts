import { IsString, IsBoolean, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateAddressDto {
  @ApiProperty({ example: "123 Main Street", required: false })
  @IsOptional()
  @IsString()
  street?: string

  @ApiProperty({ example: "Ho Chi Minh City", required: false })
  @IsOptional()
  @IsString()
  city?: string

  @ApiProperty({ example: "Vietnam", required: false })
  @IsOptional()
  @IsString()
  country?: string

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
