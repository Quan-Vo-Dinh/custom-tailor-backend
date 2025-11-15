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

  // Admin endpoints
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get all users (Admin only)",
    description: "Retrieve paginated list of all users (Admin access required)",
  })
  @ApiQuery({
    name: "skip",
    required: false,
    description: "Number of records to skip",
    example: 0,
  })
  @ApiQuery({
    name: "take",
    required: false,
    description: "Number of records to take",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of users",
    schema: {
      example: {
        data: [
          {
            id: "user_123",
            email: "user@example.com",
            fullName: "John Doe",
            role: "CUSTOMER",
            createdAt: "2025-11-12T10:00:00.000Z",
          },
        ],
        total: 100,
        skip: 0,
        take: 10,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getAllUsers(
    @Query("skip") skip?: string,
    @Query("take") take?: string
  ) {
    return this.usersService.getAllUsers(
      Number.parseInt(skip) || 0,
      Number.parseInt(take) || 10
    );
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
