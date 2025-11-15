import { Injectable, ForbiddenException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { CreateMeasurementDto } from "../dto/create-measurement.dto"
import type { UpdateMeasurementDto } from "../dto/update-measurement.dto"

@Injectable()
export class MeasurementService {
  constructor(private prisma: PrismaService) {}

  async getMeasurementsByUserId(userId: string) {
    return this.prisma.measurement.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }

  async getMeasurementById(userId: string, measurementId: string) {
    const measurement = await this.prisma.measurement.findUnique({
      where: { id: measurementId },
    })

    if (!measurement || measurement.userId !== userId) {
      throw new ForbiddenException("Measurement not found or unauthorized")
    }

    return measurement
  }

  async createMeasurement(userId: string, dto: CreateMeasurementDto) {
    const measurement = await this.prisma.measurement.create({
      data: {
        userId,
        name: dto.name,
        details: dto.details, // Stored as JSON
      },
    })

    return measurement
  }

  async updateMeasurement(userId: string, measurementId: string, dto: UpdateMeasurementDto) {
    await this.getMeasurementById(userId, measurementId)

    const updatedMeasurement = await this.prisma.measurement.update({
      where: { id: measurementId },
      data: {
        name: dto.name,
        details: dto.details,
      },
    })

    return updatedMeasurement
  }

  async deleteMeasurement(userId: string, measurementId: string) {
    await this.getMeasurementById(userId, measurementId)

    await this.prisma.measurement.delete({
      where: { id: measurementId },
    })

    return { message: "Measurement deleted successfully" }
  }
}
