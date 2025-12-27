import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import {
  FileInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
import { multerConfig } from "./multer.config";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { UploadService, FileType } from "./upload.service";
import { S3Service } from "./s3.service";
import { ProfileService } from "@/users/services/profile.service";

@ApiTags("Upload")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("upload")
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private s3Service: S3Service,
    private profileService: ProfileService
  ) {}

  @Post("avatar")
  @UseInterceptors(FileInterceptor("file", multerConfig))
  @ApiOperation({
    summary: "Upload user avatar",
    description: "Upload avatar image for current user",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Avatar uploaded successfully",
    schema: {
      example: {
        url: "https://bucket.s3.region.amazonaws.com/avatars/user-id/timestamp-uuid.jpg",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid file" })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const url = await this.uploadService.uploadFile(
      file,
      FileType.AVATAR,
      user.id
    );

    // Update profile with new avatar URL
    await this.profileService.updateProfile(user.id, { avatarUrl: url });

    return { url };
  }

  @Post("product")
  @UseInterceptors(FilesInterceptor("files", 10, multerConfig))
  @ApiOperation({
    summary: "Upload product images",
    description: "Upload one or multiple product images (max 10)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Product images uploaded successfully",
    schema: {
      example: {
        urls: [
          "https://bucket.s3.region.amazonaws.com/products/timestamp-uuid.jpg",
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid files" })
  async uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files provided");
    }

    const urls = await this.uploadService.uploadFiles(
      files,
      FileType.PRODUCT
    );

    return { urls };
  }

  @Post("fabric")
  @UseInterceptors(FileInterceptor("file", multerConfig))
  @ApiOperation({
    summary: "Upload fabric image",
    description: "Upload image for fabric material",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Fabric image uploaded successfully",
  })
  async uploadFabricImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const url = await this.uploadService.uploadFile(file, FileType.FABRIC);

    return { url };
  }

  @Post("style-option")
  @UseInterceptors(FileInterceptor("file", multerConfig))
  @ApiOperation({
    summary: "Upload style option image",
    description: "Upload image for style option",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Style option image uploaded successfully",
  })
  async uploadStyleOptionImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const url = await this.uploadService.uploadFile(
      file,
      FileType.STYLE_OPTION
    );

    return { url };
  }

  @Get("test")
  @ApiOperation({
    summary: "Test S3 connection",
    description: "Test S3 connection by listing buckets",
  })
  @ApiResponse({
    status: 200,
    description: "S3 connection test result",
    schema: {
      example: {
        success: true,
        message: "S3 connection successful!",
        buckets: [
          {
            name: "my-bucket",
            creationDate: "2024-01-01T00:00:00.000Z",
          },
        ],
        currentBucket: "my-bucket",
        region: "ap-southeast-1",
      },
    },
  })
  async testS3Connection() {
    return this.s3Service.testConnection();
  }
}

