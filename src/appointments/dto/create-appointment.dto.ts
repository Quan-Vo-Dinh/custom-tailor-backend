import { IsISO8601, IsString, IsOptional, Matches } from "class-validator"

export class CreateAppointmentDto {
  @IsISO8601()
  date: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string

  @IsString()
  @IsOptional()
  type?: string

  @IsString()
  @IsOptional()
  notes?: string
}
