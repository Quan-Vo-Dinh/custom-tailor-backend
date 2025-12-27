import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import type { CreateMeasurementDto } from "../dto/create-measurement.dto";
import type { UpdateMeasurementDto } from "../dto/update-measurement.dto";

@Injectable()
export class MeasurementService {
  constructor(private prisma: PrismaService) {}

  async getMeasurementsByUserId(userId: string) {
    return this.prisma.measurement.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getMeasurementById(userId: string, measurementId: string) {
    const measurement = await this.prisma.measurement.findUnique({
      where: { id: measurementId },
    });

    if (!measurement || measurement.userId !== userId) {
      throw new ForbiddenException("Measurement not found or unauthorized");
    }

    return measurement;
  }

  async createMeasurement(userId: string, dto: CreateMeasurementDto) {
    const measurement = await this.prisma.measurement.create({
      data: {
        userId,
        name: dto.name,
        details: dto.details, // Stored as JSON
      },
    });

    return measurement;
  }

  async updateMeasurement(
    userId: string,
    measurementId: string,
    dto: UpdateMeasurementDto
  ) {
    await this.getMeasurementById(userId, measurementId);

    const updatedMeasurement = await this.prisma.measurement.update({
      where: { id: measurementId },
      data: {
        name: dto.name,
        details: dto.details,
      },
    });

    return updatedMeasurement;
  }

  async deleteMeasurement(userId: string, measurementId: string) {
    await this.getMeasurementById(userId, measurementId);

    await this.prisma.measurement.delete({
      where: { id: measurementId },
    });

    return { message: "Measurement deleted successfully" };
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get all measurements with pagination for admin
   */
  async getAllMeasurementsPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        {
          user: {
            profile: { fullName: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    const [measurements, totalItems] = await Promise.all([
      this.prisma.measurement.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.measurement.count({ where }),
    ]);

    return {
      measurements: measurements.map((m) => ({
        id: m.id,
        name: m.name,
        details: m.details,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        user: {
          id: m.user.id,
          email: m.user.email,
          name: m.user.profile?.fullName || m.user.email,
          phone: m.user.profile?.phone,
        },
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get measurement by ID for admin (no ownership check)
   */
  async getMeasurementByIdAdmin(measurementId: string) {
    const measurement = await this.prisma.measurement.findUnique({
      where: { id: measurementId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!measurement) {
      throw new NotFoundException("Measurement not found");
    }

    return {
      id: measurement.id,
      name: measurement.name,
      details: measurement.details,
      createdAt: measurement.createdAt,
      updatedAt: measurement.updatedAt,
      user: {
        id: measurement.user.id,
        email: measurement.user.email,
        name: measurement.user.profile?.fullName || measurement.user.email,
        phone: measurement.user.profile?.phone,
      },
    };
  }

  /**
   * Get measurements by user ID for admin
   */
  async getMeasurementsByUserIdAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const measurements = await this.prisma.measurement.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.fullName || user.email,
        phone: user.profile?.phone,
      },
      measurements,
    };
  }

  /**
   * Create measurement for a user by admin
   */
  async createMeasurementAdmin(userId: string, dto: CreateMeasurementDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.measurement.create({
      data: {
        userId,
        name: dto.name,
        details: dto.details,
      },
    });
  }

  /**
   * Update measurement by admin (no ownership check)
   */
  async updateMeasurementAdmin(
    measurementId: string,
    dto: UpdateMeasurementDto
  ) {
    const measurement = await this.prisma.measurement.findUnique({
      where: { id: measurementId },
    });

    if (!measurement) {
      throw new NotFoundException("Measurement not found");
    }

    return this.prisma.measurement.update({
      where: { id: measurementId },
      data: {
        name: dto.name,
        details: dto.details,
      },
    });
  }

  /**
   * Delete measurement by admin (no ownership check)
   */
  async deleteMeasurementAdmin(measurementId: string) {
    const measurement = await this.prisma.measurement.findUnique({
      where: { id: measurementId },
    });

    if (!measurement) {
      throw new NotFoundException("Measurement not found");
    }

    await this.prisma.measurement.delete({
      where: { id: measurementId },
    });

    return { message: "Measurement deleted successfully" };
  }

  /**
   * Get measurement statistics for admin
   */
  async getMeasurementStats() {
    const [total, usersWithMeasurements, recentCount] = await Promise.all([
      this.prisma.measurement.count(),
      this.prisma.measurement.groupBy({
        by: ["userId"],
        _count: { userId: true },
      }),
      this.prisma.measurement.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      total,
      usersWithMeasurements: usersWithMeasurements.length,
      recentlyAdded: recentCount,
    };
  }
}
