import { IsString, IsOptional, IsUrl } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateProfileDto {
  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({ example: "0912345678", required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ example: "https://example.com/avatar.jpg", required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string
}
