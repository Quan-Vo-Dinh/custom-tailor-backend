# Hướng Dẫn Setup AWS S3 cho File Upload

## Tổng quan
Backend đã được tích hợp với AWS S3 để upload và quản lý files (avatars, product images, fabric images, style option images).

## Các tính năng đã triển khai

### Upload Endpoints
- ✅ `POST /upload/avatar` - Upload avatar cho user
- ✅ `POST /upload/product` - Upload product images (multiple files, max 10)
- ✅ `POST /upload/fabric` - Upload fabric image
- ✅ `POST /upload/style-option` - Upload style option image

### File Validation
- ✅ File size limit: 5MB
- ✅ Allowed types: JPEG, JPG, PNG, WEBP
- ✅ Automatic file naming với UUID và timestamp

## Bước 1: Cài đặt Dependencies

```bash
cd custom-tailor-server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
npm install --save-dev @types/multer
```

## Bước 2: Cấu hình AWS S3

### 2.1. Tạo IAM User và Access Keys

1. Đăng nhập vào AWS Console
2. Vào **IAM** → **Users** → **Create user**
3. Đặt tên user (ví dụ: `custom-tailor-s3-user`)
4. Chọn **Programmatic access**
5. Attach policy: **AmazonS3FullAccess** (hoặc tạo custom policy với quyền hạn chế hơn)
6. Lưu lại **Access Key ID** và **Secret Access Key**

### 2.2. Cấu hình S3 Bucket

Nếu bạn đã có bucket sẵn, kiểm tra các cấu hình sau:

1. **Bucket Policy** - Đảm bảo bucket cho phép public read:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

2. **CORS Configuration** - Thêm CORS để frontend có thể upload:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "YOUR-FRONTEND-URL"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. **Block Public Access Settings** - Nếu cần public read:
   - Uncheck "Block all public access" (hoặc chỉ uncheck "Block public access to buckets and objects granted through new public bucket or access point policies")

### 2.3. Cấu trúc thư mục trong S3

Files sẽ được lưu theo cấu trúc:
```
your-bucket/
├── avatars/
│   └── {userId}/
│       └── {timestamp}-{uuid}.{ext}
├── products/
│   └── {timestamp}-{uuid}.{ext}
├── fabrics/
│   └── {timestamp}-{uuid}.{ext}
└── style-options/
    └── {timestamp}-{uuid}.{ext}
```

## Bước 3: Cấu hình Environment Variables

Thêm các biến môi trường vào file `.env`:

**Option 1: Multi-vendor style (Recommended - match với dự án khác của bạn)**
```env
# S3 Configuration
S3_REGION=ap-southeast-1
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
```

**Option 2: AWS standard naming (cũng được hỗ trợ)**
```env
# AWS S3 Configuration
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Giải thích các biến:

- `S3_REGION` / `AWS_REGION`: Region của S3 bucket (ví dụ: `ap-southeast-1` cho Singapore, `us-east-1` cho N. Virginia)
- `S3_BUCKET_NAME` / `AWS_S3_BUCKET_NAME`: Tên bucket của bạn
- `S3_ACCESS_KEY` / `AWS_ACCESS_KEY_ID`: Access Key ID từ IAM user
- `S3_SECRET_ACCESS_KEY` / `AWS_SECRET_ACCESS_KEY`: Secret Access Key từ IAM user

**Lưu ý:** Backend hỗ trợ cả 2 naming conventions, bạn có thể dùng bất kỳ cái nào.

## Bước 4: Test S3 Connection

Trước khi test upload, hãy test connection:

### 4.1. Test với Swagger

1. Mở Swagger UI: `http://localhost:3001/api/docs`
2. Authorize với JWT token
3. Test endpoint: `GET /upload/test`
4. Kết quả mong đợi:
   ```json
   {
     "success": true,
     "message": "S3 connection successful!",
     "buckets": [...],
     "currentBucket": "your-bucket-name",
     "region": "ap-southeast-1"
   }
   ```

### 4.2. Test với cURL

```bash
curl -X GET http://localhost:3001/upload/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Bước 5: Test Upload

### 5.1. Test với cURL

```bash
# Upload avatar
curl -X POST http://localhost:3001/upload/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Upload product images
curl -X POST http://localhost:3001/upload/product \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

### 5.2. Test với Postman/Swagger

1. Mở Swagger UI: `http://localhost:3001/api/docs`
2. Authorize với JWT token
3. Test endpoint `/upload/avatar` hoặc `/upload/product`

## Bước 6: Tích hợp với Frontend

### Ví dụ với FormData:

```typescript
// Upload avatar
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3001/upload/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.url; // URL của file trên S3
};

// Upload product images
const uploadProductImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('http://localhost:3001/upload/product', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.urls; // Array of URLs
};
```

## Security Best Practices

### 1. IAM Policy (Recommended - thay vì FullAccess)

Tạo custom policy với quyền hạn chế:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

### 2. File Size Limits

Hiện tại limit là 5MB. Có thể điều chỉnh trong `upload.service.ts`:

```typescript
private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
```

### 3. File Type Validation

Chỉ cho phép image types. Có thể mở rộng trong `upload.service.ts`:

```typescript
private readonly allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
```

## Troubleshooting

### Lỗi: "AWS_S3_BUCKET_NAME is required"
- Kiểm tra file `.env` có đầy đủ các biến môi trường
- Restart server sau khi thay đổi `.env`

### Lỗi: "Access Denied"
- Kiểm tra IAM user có đủ quyền
- Kiểm tra bucket policy
- Kiểm tra Access Key ID và Secret Access Key

### Lỗi: "CORS policy"
- Kiểm tra CORS configuration trong S3 bucket
- Đảm bảo frontend URL được thêm vào AllowedOrigins

### Files không public
- Kiểm tra Block Public Access settings
- Kiểm tra bucket policy có cho phép public read
- Kiểm tra ACL trong PutObjectCommand (đã set "public-read")

## Production Checklist

- [ ] Sử dụng IAM policy với quyền hạn chế (không dùng FullAccess)
- [ ] Enable CloudFront CDN để tăng tốc độ (optional)
- [ ] Setup lifecycle policies để tự động xóa files cũ (optional)
- [ ] Enable versioning cho bucket (optional)
- [ ] Setup monitoring với CloudWatch
- [ ] Sử dụng environment variables khác nhau cho dev/prod
- [ ] Enable encryption at rest cho S3 bucket

## Tài liệu tham khảo

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

