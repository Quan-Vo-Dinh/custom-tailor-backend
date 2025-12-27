import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { UpdateProfileDto } from "../dto/update-profile.dto"

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfileByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user || !user.profile) {
      throw new NotFoundException("Profile not found")
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        fullName: user.profile.fullName,
        phone: user.profile.phone,
        avatarUrl: user.profile.avatarUrl,
      },
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      throw new NotFoundException("Profile not found")
    }

    await this.prisma.profile.update({
      where: { userId },
      data: {
        fullName: dto.fullName ?? profile.fullName,
        phone: dto.phone ?? profile.phone,
        avatarUrl: dto.avatarUrl ?? profile.avatarUrl,
      },
    })

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    return {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      profile: {
        fullName: user?.profile?.fullName,
        phone: user?.profile?.phone,
        avatarUrl: user?.profile?.avatarUrl,
      },
    }
  }

  async getUserStats(userId: string) {
    const [totalOrders, totalAppointments, savedMeasurements, savedAddresses] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.appointment.count({ where: { userId } }),
      this.prisma.measurement.count({ where: { userId } }),
      this.prisma.address.count({ where: { userId } }),
    ])

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    return {
      totalOrders,
      totalAppointments,
      savedMeasurements,
      savedAddresses,
      memberSince: user?.createdAt,
    }
  }
}
