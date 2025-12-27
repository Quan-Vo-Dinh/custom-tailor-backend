import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcryptjs from "bcryptjs";
import { PrismaService } from "@/prisma/prisma.service";
import type { SignUpDto } from "./dto/sign-up.dto";
import type { SignInDto } from "./dto/sign-in.dto";
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signUp(dto: SignUpDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(dto.password, 10);

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.CUSTOMER, // Default role for signup
        profile: {
          create: {
            fullName: dto.fullName,
            phone: dto.phone || null,
          },
        },
      },
      include: { profile: true },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async signIn(dto: SignInDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(
      dto.password,
      user.passwordHash || ""
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const { accessToken, refreshToken } = await this.generateTokens(
        user.id,
        user.role
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async generateTokens(userId: string, role: Role) {
    const payload = { sub: userId, role };
    const jwtExpiration = this.configService.get<string>(
      "JWT_EXPIRATION",
      "7d"
    );
    const jwtRefreshExpiration = this.configService.get<string>(
      "JWT_REFRESH_EXPIRATION",
      "30d"
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: jwtExpiration as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: jwtRefreshExpiration as any,
    });

    return { accessToken, refreshToken };
  }

  async validateUser(userId: string) {
    // Debug logging to help trace "User not found" issues
    // eslint-disable-next-line no-console
    console.log("[AuthService] validateUser called", { userId });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // eslint-disable-next-line no-console
    console.log("[AuthService] validateUser result", {
      found: !!user,
      userId,
      role: user?.role,
      email: user?.email,
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: "If email exists, password reset link has been sent" };
    }

    // TODO: Generate reset token and send email via Resend
    // For now, just return success message
    return { message: "If email exists, password reset link has been sent" };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await bcryptjs.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: "Password changed successfully" };
  }
}
