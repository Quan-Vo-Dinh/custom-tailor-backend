import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { AppointmentsService } from "./appointments.service";
import { SlotsService } from "./services/slots.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import { AssignStaffDto } from "./dto/assign-staff.dto";
import { Role } from "@prisma/client";

@ApiTags("Appointments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("appointments")
export class AppointmentsController {
  constructor(
    private appointmentsService: AppointmentsService,
    private slotsService: SlotsService
  ) {}

  @Post()
  @Roles("CUSTOMER")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new appointment",
    description: "Book a consultation appointment for measurements or fittings",
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: "Appointment created successfully",
    schema: {
      example: {
        id: "apt_123",
        customerId: "user_123",
        startTime: "2025-11-15T10:00:00.000Z",
        endTime: "2025-11-15T11:00:00.000Z",
        status: "PENDING",
        notes: "Need measurements for suit",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input or time slot not available",
  })
  async createAppointment(
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: CreateAppointmentDto
  ) {
    return await this.appointmentsService.createAppointment(user.id, dto);
  }

  @Get()
  @Roles("CUSTOMER", "STAFF", "ADMIN")
  @ApiOperation({
    summary: "Get appointments",
    description:
      "Retrieve appointments (customers see their own, staff/admin see assigned or all)",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by appointment status",
  })
  @ApiQuery({
    name: "fromDate",
    required: false,
    description: "Filter from date (ISO format)",
  })
  @ApiQuery({
    name: "toDate",
    required: false,
    description: "Filter to date (ISO format)",
  })
  @ApiResponse({ status: 200, description: "List of appointments" })
  async getAppointments(
    @CurrentUser() user: { id: string; role: Role },
    @Query("status") status?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string
  ) {
    return await this.appointmentsService.getAppointmentsByUser(
      user.id,
      user.role,
      status,
      fromDate,
      toDate
    );
  }

  @Get("admin/all")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get all appointments (Admin/Staff only)",
    description: "Retrieve all appointments with pagination and filters",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of items per page",
    example: 10,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by appointment status",
  })
  @ApiQuery({
    name: "fromDate",
    required: false,
    description: "Filter from date (ISO format)",
  })
  @ApiQuery({
    name: "toDate",
    required: false,
    description: "Filter to date (ISO format)",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by customer name, email, phone",
  })
  @ApiResponse({ status: 200, description: "Paginated list of appointments" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async getAllAppointments(
    @CurrentUser() user: { id: string; role: Role },
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
    @Query("search") search?: string
  ) {
    return await this.appointmentsService.getAllAppointmentsPaginated(
      user.id,
      user.role,
      Number.parseInt(page || "1"),
      Number.parseInt(limit || "10"),
      status,
      fromDate,
      toDate,
      search
    );
  }

  @Get("my")
  @Roles("CUSTOMER")
  @ApiOperation({
    summary: "Get my appointments (Customer only)",
    description: "Retrieve appointments for the current customer",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by appointment status",
  })
  @ApiQuery({
    name: "fromDate",
    required: false,
    description: "Filter from date (ISO format)",
  })
  @ApiQuery({
    name: "toDate",
    required: false,
    description: "Filter to date (ISO format)",
  })
  @ApiResponse({ status: 200, description: "List of customer appointments" })
  async getMyAppointments(
    @CurrentUser() user: { id: string; role: Role },
    @Query("status") status?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string
  ) {
    return await this.appointmentsService.getAppointmentsByUser(
      user.id,
      user.role,
      status,
      fromDate,
      toDate
    );
  }

  @Get("available-slots")
  @Roles("CUSTOMER")
  @ApiOperation({
    summary: "Get available time slots",
    description:
      "Retrieve available appointment time slots for a specific date",
  })
  @ApiQuery({
    name: "date",
    required: true,
    description: "Date in ISO format (YYYY-MM-DD)",
    example: "2025-11-15",
  })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Appointment type",
  })
  @ApiResponse({
    status: 200,
    description: "Available time slots",
    schema: {
      example: [
        {
          id: "slot_1",
          date: "2025-11-15",
          startTime: "09:00",
          endTime: "10:00",
          available: true,
        },
        {
          id: "slot_2",
          date: "2025-11-15",
          startTime: "10:00",
          endTime: "11:00",
          available: false,
        },
      ],
    },
  })
  async getAvailableSlots(
    @Query("date") date: string,
    @Query("type") type?: string
  ) {
    return await this.slotsService.getAvailableSlots(new Date(date), type);
  }

  @Get("check-availability")
  @Roles("CUSTOMER")
  @ApiOperation({
    summary: "Check if a time slot is available",
    description: "Check if a specific time slot is available for booking",
  })
  @ApiQuery({
    name: "date",
    required: true,
    description: "Date in ISO format (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "startTime",
    required: true,
    description: "Start time (HH:mm)",
  })
  @ApiQuery({
    name: "endTime",
    required: true,
    description: "End time (HH:mm)",
  })
  @ApiResponse({
    status: 200,
    description: "Availability check result",
    schema: {
      example: {
        available: true,
      },
    },
  })
  async checkAvailability(
    @Query("date") date: string,
    @Query("startTime") startTime: string,
    @Query("endTime") endTime: string
  ) {
    const isAvailable = await this.slotsService.checkSlotAvailability(
      date,
      startTime,
      endTime
    );
    return { available: isAvailable };
  }

  @Get("stats")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({
    summary: "Get appointment statistics",
    description: "Retrieve appointment statistics for admin/staff",
  })
  @ApiQuery({
    name: "fromDate",
    required: false,
    description: "Start date for statistics",
  })
  @ApiQuery({
    name: "toDate",
    required: false,
    description: "End date for statistics",
  })
  @ApiResponse({
    status: 200,
    description: "Appointment statistics",
    schema: {
      example: {
        total: 100,
        pending: 10,
        confirmed: 20,
        completed: 60,
        cancelled: 8,
        noShow: 2,
      },
    },
  })
  async getAppointmentStats(
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string
  ) {
    return await this.appointmentsService.getAppointmentStats(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    );
  }

  @Get(":id")
  @Roles("CUSTOMER", "STAFF", "ADMIN")
  @ApiOperation({
    summary: "Get appointment by ID",
    description: "Retrieve detailed information about a specific appointment",
  })
  @ApiParam({ name: "id", description: "Appointment ID", example: "apt_123" })
  @ApiResponse({ status: 200, description: "Appointment details" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Not authorized to view this appointment",
  })
  async getAppointmentById(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: Role }
  ) {
    return await this.appointmentsService.getAppointmentById(
      id,
      user.id,
      user.role
    );
  }

  @Patch(":id/status")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({
    summary: "Update appointment status",
    description:
      "Update appointment status (PENDING → CONFIRMED → COMPLETED or CANCELLED)",
  })
  @ApiParam({ name: "id", description: "Appointment ID", example: "apt_123" })
  @ApiBody({ type: UpdateAppointmentStatusDto })
  @ApiResponse({
    status: 200,
    description: "Appointment status updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin/Staff access required",
  })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser() user: { id: string; role: Role }
  ) {
    return await this.appointmentsService.updateAppointmentStatus(
      id,
      dto,
      user.id,
      user.role
    );
  }

  @Patch(":id/assign-staff")
  @Roles("ADMIN")
  @ApiOperation({
    summary: "Assign staff to appointment",
    description: "Assign a staff member to handle an appointment",
  })
  @ApiParam({ name: "id", description: "Appointment ID", example: "apt_123" })
  @ApiBody({ type: AssignStaffDto })
  @ApiResponse({ status: 200, description: "Staff assigned successfully" })
  @ApiResponse({ status: 404, description: "Appointment or Staff not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async assignStaff(
    @Param("id") id: string,
    @Body() dto: AssignStaffDto,
    @CurrentUser() user: { id: string; role: Role }
  ) {
    return await this.appointmentsService.assignStaff(id, dto.staffId, user.id);
  }

  @Patch(":id/cancel")
  @Roles("CUSTOMER", "ADMIN")
  @ApiOperation({
    summary: "Cancel appointment",
    description:
      "Cancel an appointment (customers can cancel their own, admins can cancel any)",
  })
  @ApiParam({ name: "id", description: "Appointment ID", example: "apt_123" })
  @ApiResponse({
    status: 200,
    description: "Appointment cancelled successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not authorized" })
  async cancelAppointment(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: Role }
  ) {
    return await this.appointmentsService.cancelAppointment(
      id,
      user.id,
      user.role
    );
  }

  @Patch(":id/reschedule")
  @Roles("CUSTOMER", "ADMIN")
  @ApiOperation({
    summary: "Reschedule appointment",
    description: "Reschedule an appointment to a new date and time",
  })
  @ApiParam({ name: "id", description: "Appointment ID", example: "apt_123" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        date: { type: "string", example: "2025-11-20" },
        startTime: { type: "string", example: "14:00" },
        endTime: { type: "string", example: "15:00" },
      },
      required: ["date", "startTime", "endTime"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Appointment rescheduled successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not authorized" })
  @ApiResponse({ status: 400, description: "Time slot not available" })
  async rescheduleAppointment(
    @Param("id") id: string,
    @Body() dto: { date: string; startTime: string; endTime: string },
    @CurrentUser() user: { id: string; role: Role }
  ) {
    return await this.appointmentsService.rescheduleAppointment(
      id,
      dto,
      user.id,
      user.role
    );
  }

  @Delete(":id")
  @Roles("CUSTOMER", "ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete appointment (Admin only)",
    description: "Permanently delete an appointment (admins can delete any)",
  })
  @ApiParam({ name: "id", description: "Appointment ID", example: "apt_123" })
  @ApiResponse({
    status: 204,
    description: "Appointment deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({ status: 403, description: "Forbidden - Not authorized" })
  async deleteAppointment(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: Role }
  ) {
    return await this.appointmentsService.deleteAppointment(
      id,
      user.id,
      user.role
    );
  }
}
