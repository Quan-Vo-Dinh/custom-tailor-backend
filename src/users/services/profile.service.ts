import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { UpdateProfileDto } from "../dto/update-profile.dto"

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      throw new NotFoundException("Profile not found")
    }

    return profile
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      throw new NotFoundException("Profile not found")
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        fullName: dto.fullName || profile.fullName,
        phone: dto.phone !== undefined ? dto.phone : profile.phone,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : profile.avatarUrl,
      },
    })

    return updatedProfile
  }
}
