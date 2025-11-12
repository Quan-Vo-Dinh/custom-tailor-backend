import { IsEmail, IsString, MinLength, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SignUpDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ example: "John Doe" })
  @IsString()
  fullName: string

  @ApiProperty({ example: "0912345678", required: false })
  @IsOptional()
  @IsString()
  phone?: string
}
