import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: true,
        measurements: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Don't return sensitive fields
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(skip = 0, take = 10) {
    const users = await this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    const total = await this.prisma.user.count();

    return { data: users, total, skip, take };
  }

  async updateUser(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        profile: true,
        addresses: true,
        measurements: true,
      },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully" };
  }
}
