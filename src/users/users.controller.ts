import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  UseGuards,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { ProfileService } from "./services/profile.service";
import { AddressService } from "./services/address.service";
import { MeasurementService } from "./services/measurement.service";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { CreateMeasurementDto } from "./dto/create-measurement.dto";
import { UpdateMeasurementDto } from "./dto/update-measurement.dto";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private profileService: ProfileService,
    private addressService: AddressService,
    private measurementService: MeasurementService
  ) {}

  @Get("profile")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieve profile information of the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      example: {
        id: "cm3b9x8qk0000v5l8g2v5g2v5",
        email: "user@example.com",
        fullName: "John Doe",
        phone: "0912345678",
        avatarUrl: "https://example.com/avatar.jpg",
        role: "CUSTOMER",
      },
    },
  })
  async getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfileByUserId(user.id);
  }

  @Get("profile/stats")
  @ApiOperation({
    summary: "Get user statistics",
    description:
      "Retrieve user statistics (orders, appointments, measurements, addresses)",
  })
  @ApiResponse({
    status: 200,
    description: "User statistics",
    schema: {
      example: {
        totalOrders: 5,
        totalAppointments: 3,
        savedMeasurements: 2,
        savedAddresses: 1,
        memberSince: "2024-01-15T10:00:00.000Z",
      },
    },
  })
  async getUserStats(@CurrentUser() user: any) {
    return this.profileService.getUserStats(user.id);
  }

  @Put("profile")
  @ApiOperation({
    summary: "Update current user profile",
    description: "Update profile information (fullName, phone, avatarUrl)",
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  // Address endpoints
  @Get("addresses")
  @ApiOperation({
    summary: "Get all addresses of current user",
    description: "Retrieve all saved addresses for the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "List of addresses",
    schema: {
      example: [
        {
          id: "addr_123",
          street: "123 Main Street",
          city: "Ho Chi Minh City",
          country: "Vietnam",
          isDefault: true,
        },
      ],
    },
  })
  async getAddresses(@CurrentUser() user: any) {
    return this.addressService.getAddressesByUserId(user.id);
  }

  @Post("addresses")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new address",
    description: "Add a new delivery address for the user",
  })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: 201, description: "Address created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createAddress(@CurrentUser() user: any, @Body() dto: CreateAddressDto) {
    return this.addressService.createAddress(user.id, dto);
  }

  @Put("addresses/:addressId")
  @ApiOperation({
    summary: "Update an address",
    description: "Update an existing address by ID",
  })
  @ApiParam({
    name: "addressId",
    description: "Address ID",
    example: "addr_123",
  })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: "Address updated successfully" })
  @ApiResponse({ status: 404, description: "Address not found" })
  async updateAddress(
    @CurrentUser() user: any,
    @Param("addressId") addressId: string,
    @Body() dto: UpdateAddressDto
  ) {
    return this.addressService.updateAddress(user.id, addressId, dto);
  }

  @Delete("addresses/:addressId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete an address",
    description: "Remove an address by ID",
  })
  @ApiParam({
    name: "addressId",
    description: "Address ID",
    example: "addr_123",
  })
  @ApiResponse({ status: 204, description: "Address deleted successfully" })
  @ApiResponse({ status: 404, description: "Address not found" })
  async deleteAddress(
    @CurrentUser() user: any,
    @Param("addressId") addressId: string
  ) {
    return this.addressService.deleteAddress(user.id, addressId);
  }

  @Put("addresses/:addressId/set-default")
  @ApiOperation({
    summary: "Set address as default",
    description: "Mark an address as the default delivery address",
  })
  @ApiParam({
    name: "addressId",
    description: "Address ID",
    example: "addr_123",
  })
  @ApiResponse({
    status: 200,
    description: "Default address updated successfully",
  })
  @ApiResponse({ status: 404, description: "Address not found" })
  async setDefaultAddress(
    @CurrentUser() user: any,
    @Param("addressId") addressId: string
  ) {
    return this.addressService.setDefaultAddress(user.id, addressId);
  }

  // Measurement endpoints
  @Get("measurements")
  @ApiOperation({
    summary: "Get all measurements of current user",
    description: "Retrieve all saved body measurements",
  })
  @ApiResponse({
    status: 200,
    description: "List of measurements",
    schema: {
      example: [
        {
          id: "meas_123",
          name: "Số đo Vest",
          details: { vai: 40, nguc: 90, eo: 70, dai_tay: 60 },
          createdAt: "2025-11-12T10:00:00.000Z",
        },
      ],
    },
  })
  async getMeasurements(@CurrentUser() user: any) {
    return this.measurementService.getMeasurementsByUserId(user.id);
  }

  @Post("measurements")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new measurement",
    description: "Add a new body measurement profile",
  })
  @ApiBody({ type: CreateMeasurementDto })
  @ApiResponse({ status: 201, description: "Measurement created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createMeasurement(
    @CurrentUser() user: any,
    @Body() dto: CreateMeasurementDto
  ) {
    return this.measurementService.createMeasurement(user.id, dto);
  }

  @Put("measurements/:measurementId")
  @ApiOperation({
    summary: "Update a measurement",
    description: "Update an existing body measurement by ID",
  })
  @ApiParam({
    name: "measurementId",
    description: "Measurement ID",
    example: "meas_123",
  })
  @ApiBody({ type: UpdateMeasurementDto })
  @ApiResponse({ status: 200, description: "Measurement updated successfully" })
  @ApiResponse({ status: 404, description: "Measurement not found" })
  async updateMeasurement(
    @CurrentUser() user: any,
    @Param("measurementId") measurementId: string,
    @Body() dto: UpdateMeasurementDto
  ) {
    return this.measurementService.updateMeasurement(
      user.id,
      measurementId,
      dto
    );
  }

  @Delete("measurements/:measurementId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a measurement",
    description: "Remove a body measurement by ID",
  })
  @ApiParam({
    name: "measurementId",
    description: "Measurement ID",
    example: "meas_123",
  })
  @ApiResponse({ status: 204, description: "Measurement deleted successfully" })
  @ApiResponse({ status: 404, description: "Measurement not found" })
  async deleteMeasurement(
    @CurrentUser() user: any,
    @Param("measurementId") measurementId: string
  ) {
    return this.measurementService.deleteMeasurement(user.id, measurementId);
  }

  // ==================== ADMIN MEASUREMENT ENDPOINTS ====================

  @Get("admin/measurements")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get all measurements (Admin/Staff only)",
    description: "Retrieve paginated list of all customer measurements",
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by name, email",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiResponse({ status: 200, description: "Paginated list of measurements" })
  async getAllMeasurementsAdmin(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("userId") userId?: string
  ) {
    return this.measurementService.getAllMeasurementsPaginated(
      Number.parseInt(page || "1"),
      Number.parseInt(limit || "10"),
      search,
      userId
    );
  }

  @Get("admin/measurements/stats")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get measurement statistics (Admin/Staff only)",
    description: "Retrieve statistics about measurements",
  })
  @ApiResponse({ status: 200, description: "Measurement statistics" })
  async getMeasurementStats() {
    return this.measurementService.getMeasurementStats();
  }

  @Get("admin/measurements/:measurementId")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get measurement by ID (Admin/Staff only)",
    description: "Retrieve detailed measurement information",
  })
  @ApiParam({ name: "measurementId", description: "Measurement ID" })
  @ApiResponse({ status: 200, description: "Measurement details" })
  @ApiResponse({ status: 404, description: "Measurement not found" })
  async getMeasurementByIdAdmin(@Param("measurementId") measurementId: string) {
    return this.measurementService.getMeasurementByIdAdmin(measurementId);
  }

  @Get("admin/users/:userId/measurements")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get measurements by user ID (Admin/Staff only)",
    description: "Retrieve all measurements for a specific user",
  })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "User measurements" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getMeasurementsByUserIdAdmin(@Param("userId") userId: string) {
    return this.measurementService.getMeasurementsByUserIdAdmin(userId);
  }

  @Post("admin/users/:userId/measurements")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create measurement for user (Admin/Staff only)",
    description: "Create a new measurement for a specific user",
  })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiBody({ type: CreateMeasurementDto })
  @ApiResponse({ status: 201, description: "Measurement created" })
  @ApiResponse({ status: 404, description: "User not found" })
  async createMeasurementAdmin(
    @Param("userId") userId: string,
    @Body() dto: CreateMeasurementDto
  ) {
    return this.measurementService.createMeasurementAdmin(userId, dto);
  }

  @Put("admin/measurements/:measurementId")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Update measurement (Admin/Staff only)",
    description: "Update an existing measurement",
  })
  @ApiParam({ name: "measurementId", description: "Measurement ID" })
  @ApiBody({ type: UpdateMeasurementDto })
  @ApiResponse({ status: 200, description: "Measurement updated" })
  @ApiResponse({ status: 404, description: "Measurement not found" })
  async updateMeasurementAdmin(
    @Param("measurementId") measurementId: string,
    @Body() dto: UpdateMeasurementDto
  ) {
    return this.measurementService.updateMeasurementAdmin(measurementId, dto);
  }

  @Delete("admin/measurements/:measurementId")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete measurement (Admin/Staff only)",
    description: "Delete a measurement",
  })
  @ApiParam({ name: "measurementId", description: "Measurement ID" })
  @ApiResponse({ status: 204, description: "Measurement deleted" })
  @ApiResponse({ status: 404, description: "Measurement not found" })
  async deleteMeasurementAdmin(@Param("measurementId") measurementId: string) {
    return this.measurementService.deleteMeasurementAdmin(measurementId);
  }

  // ==================== ADMIN USER ENDPOINTS ====================

  // Admin endpoints
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get all users (Admin only)",
    description: "Retrieve paginated list of all users (Admin access required)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number (1-based)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of records per page",
    example: 10,
  })
  @ApiQuery({
    name: "role",
    required: false,
    description: "Filter by role (CUSTOMER, STAFF, ADMIN)",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by email, name, or phone",
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of users",
    schema: {
      example: {
        users: [
          {
            id: "user_123",
            email: "user@example.com",
            name: "John Doe",
            role: "CUSTOMER",
            createdAt: "2025-11-12T10:00:00.000Z",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 10,
          totalItems: 100,
          itemsPerPage: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getAllUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("role") role?: string,
    @Query("search") search?: string
  ) {
    const pageNum = Number.parseInt(page || "1");
    const limitNum = Number.parseInt(limit || "10");
    const skip = (pageNum - 1) * limitNum;

    return this.usersService.getAllUsers(skip, limitNum, role, search);
  }

  @Get(":userId")
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get user by ID (Admin only)",
    description: "Retrieve detailed information of a specific user by ID",
  })
  @ApiParam({ name: "userId", description: "User ID", example: "user_123" })
  @ApiResponse({ status: 200, description: "User details" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getUserById(@Param("userId") userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Delete(":userId")
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete user (Admin only)",
    description: "Permanently delete a user account",
  })
  @ApiParam({ name: "userId", description: "User ID", example: "user_123" })
  @ApiResponse({ status: 204, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async deleteUser(@Param("userId") userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
