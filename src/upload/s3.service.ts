import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    // Support both naming conventions (multi-vendor style and AWS standard)
    this.region =
      this.configService.get<string>("S3_REGION") ||
      this.configService.get<string>("AWS_REGION") ||
      "ap-southeast-1";
    
    this.bucketName =
      this.configService.get<string>("S3_BUCKET_NAME") ||
      this.configService.get<string>("AWS_S3_BUCKET_NAME") ||
      "";

    if (!this.bucketName) {
      throw new Error("S3_BUCKET_NAME or AWS_S3_BUCKET_NAME is required");
    }

    const accessKeyId =
      this.configService.get<string>("S3_ACCESS_KEY") ||
      this.configService.get<string>("AWS_ACCESS_KEY_ID") ||
      "";
    
    const secretAccessKey =
      this.configService.get<string>("S3_SECRET_ACCESS_KEY") ||
      this.configService.get<string>("AWS_SECRET_ACCESS_KEY") ||
      "";

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("S3_ACCESS_KEY and S3_SECRET_ACCESS_KEY (or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) are required");
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload file to S3
   * @param file - File buffer
   * @param key - S3 object key (path)
   * @param contentType - MIME type
   * @returns S3 object URL
   */
  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      // Return public URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete file from S3
   * @param key - S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate presigned URL for temporary access
   * @param key - S3 object key
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Presigned URL
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate presigned URL: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Extract key from S3 URL
   * @param url - Full S3 URL
   * @returns S3 object key
   */
  extractKeyFromUrl(url: string): string {
    const regex = /https:\/\/[^/]+\/(.+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  }

  /**
   * Test S3 connection by listing buckets
   * @returns List of buckets
   */
  async testConnection() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      
      return {
        success: true,
        message: "S3 connection successful!",
        buckets: response.Buckets?.map((bucket) => ({
          name: bucket.Name,
          creationDate: bucket.CreationDate,
        })) || [],
        currentBucket: this.bucketName,
        region: this.region,
      };
    } catch (error) {
      throw new BadRequestException(
        `S3 connection error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

