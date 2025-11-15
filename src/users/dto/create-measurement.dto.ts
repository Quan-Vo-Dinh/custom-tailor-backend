import { IsString, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMeasurementDto {
  @ApiProperty({ example: "Số đo Vest" })
  @IsString()
  name: string;

  @ApiProperty({
    example: { vai: 40, nguc: 90, eo: 70, dai_tay: 60 },
    additionalProperties: true,
  })
  @IsObject()
  details: Record<string, number>;
}
