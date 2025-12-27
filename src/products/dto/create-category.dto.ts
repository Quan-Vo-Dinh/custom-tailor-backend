import { IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateCategoryDto {
  @ApiProperty({ example: "Áo Vest" })
  @IsString()
  name: string

  @ApiProperty({ example: "ao-vest" })
  @IsString()
  slug: string
}
