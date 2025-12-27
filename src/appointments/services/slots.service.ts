import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CacheService } from "@/cache/cache.service";

@Injectable()
export class SlotsService {
  // Default business hours: 8 AM - 6 PM, 1 hour slots
  private readonly SLOT_DURATION_MINUTES = 60;
  private readonly BUSINESS_HOURS_START = 8;
  private readonly BUSINESS_HOURS_END = 18;
  private readonly CACHE_TTL = 60; // Cache slots for 60 seconds

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService
  ) {}

  async getAvailableSlots(date: Date, type?: string) {
    // Generate cache key for this date
    const dateStr = date.toISOString().split("T")[0];
    const cacheKey = `slots:${dateStr}${type ? `:${type}` : ""}`;

    // Try to get from cache
    const cachedSlots = await this.cacheService.get(cacheKey);
    if (cachedSlots) {
      return cachedSlots;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(this.BUSINESS_HOURS_START, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(this.BUSINESS_HOURS_END, 0, 0, 0);

    // Get all non-cancelled appointments for the day
    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        NOT: { status: "CANCELLED" },
        startTime: { gte: startOfDay, lt: endOfDay },
      },
      select: { startTime: true, endTime: true },
    });

    const slots = [];
    let currentTime = new Date(startOfDay);
    let slotIndex = 0;

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + this.SLOT_DURATION_MINUTES);

      // Check if this slot conflicts with any booked appointment
      const isBooked = bookedAppointments.some(
        (apt) => apt.startTime < slotEnd && apt.endTime > currentTime
      );

      const startTimeStr = currentTime.toTimeString().slice(0, 5); // HH:mm format
      const endTimeStr = slotEnd.toTimeString().slice(0, 5);

      slots.push({
        id: `slot_${slotIndex++}`,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        available: !isBooked,
      });

      currentTime = slotEnd;
    }

    // Cache the result
    await this.cacheService.set(cacheKey, slots, this.CACHE_TTL);

    return slots;
  }

  async checkSlotAvailability(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    // Parse date and time
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (start >= end) {
      return false;
    }

    // Check for conflicting appointments
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

    return conflictingAppointments.length === 0;
  }

  /**
   * Invalidate slot cache for a specific date
   * Should be called after creating/updating/cancelling an appointment
   */
  async invalidateSlotCache(date: string): Promise<void> {
    const cacheKey = `slots:${date}`;
    await this.cacheService.delete(cacheKey);
  }
}
