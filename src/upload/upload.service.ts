import { Injectable, BadRequestException } from "@nestjs/common";
import { S3Service } from "./s3.service";
import * as path from "path";
import { randomBytes } from "crypto";

export enum FileType {
  AVATAR = "avatars",
  PRODUCT = "products",
  FABRIC = "fabrics",
  STYLE_OPTION = "style-options",
}

@Injectable()
export class UploadService {
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  constructor(private s3Service: S3Service) {}

  /**
   * Validate file
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedImageTypes.join(", ")}`
      );
    }
  }

  /**
   * Generate S3 key for file
   */
  generateKey(fileType: FileType, filename: string, userId?: string): string {
    const ext = path.extname(filename);
    const uniqueId = randomBytes(16).toString("hex");
    const timestamp = Date.now();

    switch (fileType) {
      case FileType.AVATAR:
        if (!userId) {
          throw new BadRequestException("User ID is required for avatar upload");
        }
        return `${fileType}/${userId}/${timestamp}-${uniqueId}${ext}`;
      case FileType.PRODUCT:
        return `${fileType}/${timestamp}-${uniqueId}${ext}`;
      case FileType.FABRIC:
        return `${fileType}/${timestamp}-${uniqueId}${ext}`;
      case FileType.STYLE_OPTION:
        return `${fileType}/${timestamp}-${uniqueId}${ext}`;
      default:
        return `uploads/${timestamp}-${uniqueId}${ext}`;
    }
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    fileType: FileType,
    userId?: string
  ): Promise<string> {
    this.validateFile(file);

    const key = this.generateKey(fileType, file.originalname, userId);
    const url = await this.s3Service.uploadFile(
      file.buffer,
      key,
      file.mimetype
    );

    return url;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    fileType: FileType,
    userId?: string
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files provided");
    }

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, fileType, userId)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from S3
   */
  async deleteFile(url: string): Promise<void> {
    const key = this.s3Service.extractKeyFromUrl(url);
    await this.s3Service.deleteFile(key);
  }
}

