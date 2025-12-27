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

  async getAllUsers(skip = 0, take = 10, role?: string, search?: string) {
    const where: any = {};

    // Role filter
    if (role) {
      where.role = role;
    }

    // Search filter (by email or profile name/phone)
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        {
          profile: {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Map to frontend-expected format
    const mappedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.profile?.fullName || u.email?.split("@")[0],
      phone: u.profile?.phone || null,
      avatar: u.profile?.avatarUrl || null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    const page = Math.floor(skip / take) + 1;

    return {
      users: mappedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take,
      },
    };
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
