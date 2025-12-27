import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { NotificationsService } from "@/notifications/notifications.service";
import { CacheService } from "@/cache/cache.service";
import type { CreateAppointmentDto } from "./dto/create-appointment.dto";
import type { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import type { AppointmentStatus, Role } from "@prisma/client";

@Injectable()
export class AppointmentsService {
  private logger = new Logger("AppointmentsService");

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private cacheService: CacheService
  ) {}

  async createAppointment(userId: string, dto: CreateAppointmentDto) {
    const { date, startTime, endTime, notes } = dto;

    // Build full datetime from date + HH:mm
    const start = new Date(`${date}T${startTime}:00.000Z`);
    const end = new Date(`${date}T${endTime}:00.000Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException("Invalid start or end time");
    }

    // Validate time range
    if (start >= end) {
      throw new BadRequestException("Start time must be before end time");
    }

    // Try to acquire distributed lock (prevent race condition)
    const lockAcquired = await this.cacheService.lockSlot(date, startTime, 60); // 60 seconds lock
    if (!lockAcquired) {
      this.logger.warn(
        `Slot ${date} ${startTime} is being processed by another request`
      );
      throw new ConflictException(
        "This time slot is currently being processed. Please try again in a moment."
      );
    }

    try {
      // Check for conflicting appointments (double-booking prevention)
      const conflictingAppointments = await this.prisma.appointment.findMany({
        where: {
          NOT: { status: "CANCELLED" },
          OR: [
            {
              AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
            },
          ],
        },
      });

      if (conflictingAppointments.length > 0) {
        throw new BadRequestException("This time slot is already booked");
      }

      // Create appointment (initially PENDING)
      const appointment = await this.prisma.appointment.create({
        data: {
          userId,
          startTime: start,
          endTime: end,
          notes: notes || null,
          status: "PENDING",
        },
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      });

      // Invalidate slots cache for this date
      await this.cacheService.invalidateSlotsCache(date);

      return appointment;
    } finally {
      // Always release the lock
      await this.cacheService.unlockSlot(date, startTime);
      this.logger.debug(`Released lock for slot ${date} ${startTime}`);
    }
  }

  async getAppointmentsByUser(
    userId: string,
    role: Role,
    status?: string,
    fromDate?: string,
    toDate?: string
  ) {
    const where: any = {};

    if (role === "CUSTOMER") {
      // Customers can only see their own appointments
      where.userId = userId;
    } else if (role === "STAFF") {
      // Staff can see appointments assigned to them
      where.staffId = userId;
    }
    // Admin can see all appointments (no where clause)

    // Status filter
    if (status) {
      where.status = status;
    }

    // Date range filter
    if (fromDate || toDate) {
      where.startTime = {};
      if (fromDate) {
        where.startTime.gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        where.startTime.lte = to;
      }
    }

    return await this.prisma.appointment.findMany({
      where,
      include: {
        user: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    });
  }

  async getAppointmentById(id: string, userId: string, role: Role) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    // Authorization check
    if (role === "CUSTOMER" && appointment.userId !== userId) {
      throw new ForbiddenException("You cannot access this appointment");
    }
    if (role === "STAFF" && appointment.staffId !== userId) {
      throw new ForbiddenException("You cannot access this appointment");
    }

    return appointment;
  }

  async updateAppointmentStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
    userId: string,
    role: Role
  ) {
    const appointment = await this.getAppointmentById(id, userId, role);

    const { status } = dto;

    // State Machine validation
    const validTransitions = this.getValidTransitions(appointment.status);
    if (!validTransitions.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${appointment.status} to ${status}`
      );
    }

    // Only ADMIN can confirm; only STAFF/ADMIN can update to IN_PROGRESS/COMPLETED
    if (status === "CONFIRMED" && role !== "ADMIN") {
      throw new ForbiddenException("Only Admin can confirm appointments");
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        user: {
          include: { profile: true },
        },
        staff: {
          include: { profile: true },
        },
      },
    });

    // Invalidate slots cache if appointment is cancelled (slot becomes available again)
    if (status === "CANCELLED") {
      const appointmentDate = updatedAppointment.startTime
        .toISOString()
        .split("T")[0];
      await this.cacheService.invalidateSlotsCache(appointmentDate);
      this.logger.debug(
        `Invalidated slots cache for date ${appointmentDate} after cancellation`
      );
    }

    // Send email notification based on status
    try {
      const customerEmail = updatedAppointment.user.email;
      const customerName =
        (updatedAppointment.user as any).profile?.fullName || "Quý khách";

      if (status === "CONFIRMED") {
        await this.notificationsService.sendAppointmentConfirmedEmail(
          customerEmail,
          {
            appointmentId: updatedAppointment.id,
            customerName,
            startTime: updatedAppointment.startTime.toISOString(),
            endTime: updatedAppointment.endTime.toISOString(),
          }
        );
        this.logger.log(
          `Appointment confirmed email sent for appointment ${updatedAppointment.id}`
        );
      } else if (status === "CANCELLED") {
        await this.notificationsService.sendAppointmentCancelledEmail(
          customerEmail,
          {
            appointmentId: updatedAppointment.id,
            customerName,
            startTime: updatedAppointment.startTime.toISOString(),
          }
        );
        this.logger.log(
          `Appointment cancelled email sent for appointment ${updatedAppointment.id}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send appointment email: ${(error as Error).message}`
      );
      // Don't throw - appointment was updated successfully
    }

    return updatedAppointment;
  }

  async assignStaff(appointmentId: string, staffId: string, adminId: string) {
    // Only Admin can assign
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    // Verify staff exists
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff || staff.role !== "STAFF") {
      throw new BadRequestException("Staff member not found or invalid role");
    }

    return await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { staffId },
      include: {
        user: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
      },
    });
  }

  async cancelAppointment(id: string, userId: string, role: Role) {
    const appointment = await this.getAppointmentById(id, userId, role);

    if (appointment.status === "CANCELLED") {
      throw new BadRequestException("Appointment is already cancelled");
    }

    if (appointment.status === "COMPLETED") {
      throw new BadRequestException("Cannot cancel a completed appointment");
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  async rescheduleAppointment(
    id: string,
    dto: { date: string; startTime: string; endTime: string },
    userId: string,
    role: Role
  ) {
    const appointment = await this.getAppointmentById(id, userId, role);

    if (appointment.status === "COMPLETED") {
      throw new BadRequestException(
        "Cannot reschedule a completed appointment"
      );
    }

    // Combine date and time
    const start = new Date(`${dto.date}T${dto.startTime}:00`);
    const end = new Date(`${dto.date}T${dto.endTime}:00`);

    if (start >= end) {
      throw new BadRequestException("Start time must be before end time");
    }

    // Check for conflicting appointments
    const conflictingAppointments = await this.prisma.appointment.findMany({
      where: {
        id: { not: id },
        status: { not: "CANCELLED" },
        OR: [
          {
            AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
          },
        ],
      },
    });

    if (conflictingAppointments.length > 0) {
      throw new BadRequestException("This time slot is already booked");
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: {
        startTime: start,
        endTime: end,
      },
      include: {
        user: { select: { id: true, email: true } },
        staff: { select: { id: true, email: true } },
      },
    });
  }

  async deleteAppointment(id: string, userId: string, role: Role) {
    const appointment = await this.getAppointmentById(id, userId, role);

    // Only ADMIN can delete
    if (role !== "ADMIN") {
      throw new ForbiddenException("Only admin can delete appointments");
    }

    await this.prisma.appointment.delete({
      where: { id },
    });

    return { message: "Appointment deleted successfully" };
  }

  async getAppointmentStats(fromDate?: Date, toDate?: Date) {
    const where: any = {};

    if (fromDate || toDate) {
      where.startTime = {};
      if (fromDate) {
        where.startTime.gte = fromDate;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.startTime.lte = to;
      }
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      select: { status: true },
    });

    const stats = {
      total: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    };

    appointments.forEach((apt) => {
      stats[apt.status.toLowerCase() as keyof typeof stats]++;
    });

    return stats;
  }

  async getAllAppointmentsPaginated(
    userId: string,
    role: Role,
    page: number = 1,
    limit: number = 10,
    status?: string,
    fromDate?: string,
    toDate?: string,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Staff can only see appointments assigned to them
    if (role === "STAFF") {
      where.staffId = userId;
    }
    // Admin can see all appointments

    // Status filter
    if (status) {
      where.status = status;
    }

    // Date range filter
    if (fromDate || toDate) {
      where.startTime = {};
      if (fromDate) {
        where.startTime.gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.startTime.lte = to;
      }
    }

    // Search filter (by user email, profile name, phone)
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          {
            profile: {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      };
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, phone: true } },
            },
          },
          staff: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
        orderBy: { startTime: "desc" },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getValidTransitions(
    currentStatus: AppointmentStatus
  ): AppointmentStatus[] {
    const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };
    return transitions[currentStatus] || [];
  }
}
