# Nhiệm Vụ Cấu Hình S3 trên AWS Console

## Tổng quan
Tài liệu này hướng dẫn các bước cấu hình S3 bucket trên AWS Console để sử dụng với custom-tailor-server.

## Thông tin cấu hình từ multi-vendor

Dựa trên source multi-vendor, bạn đã sử dụng các biến môi trường sau:
- `S3_REGION` - Region của S3 bucket
- `S3_ACCESS_KEY` - AWS Access Key ID
- `S3_SECRET_ACCESS_KEY` - AWS Secret Access Key
- `S3_BUCKET_NAME` - Tên bucket

**Lưu ý:** Custom-tailor-server hỗ trợ cả 2 naming conventions:
- Multi-vendor style: `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- AWS standard: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`

## Checklist Cấu Hình S3 trên AWS Console

### ✅ Bước 1: Kiểm tra Bucket hiện tại

1. Đăng nhập vào [AWS Console](https://console.aws.amazon.com/)
2. Vào **S3** service
3. Tìm bucket bạn đã tạo cho dự án khác
4. Ghi lại:
   - **Bucket name**: `_________________`
   - **Region**: `_________________` (ví dụ: ap-southeast-1)

### ✅ Bước 2: Cấu hình Bucket Policy

1. Chọn bucket → **Permissions** tab
2. Scroll xuống **Bucket policy**
3. Click **Edit**
4. Thêm policy sau (thay `YOUR-BUCKET-NAME` bằng tên bucket thực tế):

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
    },
    {
      "Sid": "AllowUploadFromBackend",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

**Lưu ý:**
- Thay `YOUR-BUCKET-NAME` bằng tên bucket
- Thay `YOUR-ACCOUNT-ID` bằng AWS Account ID (tìm ở góc trên bên phải AWS Console)
- Thay `YOUR-IAM-USER` bằng tên IAM user (nếu đã có) hoặc bỏ qua phần này nếu dùng Access Key

5. Click **Save changes**

### ✅ Bước 3: Cấu hình CORS

1. Vẫn trong **Permissions** tab
2. Scroll xuống **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Thêm cấu hình sau:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "YOUR-FRONTEND-PRODUCTION-URL"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**Lưu ý:**
- Thay `YOUR-FRONTEND-PRODUCTION-URL` bằng URL production của frontend (nếu có)
- Có thể thêm nhiều origins nếu cần

5. Click **Save changes**

### ✅ Bước 4: Cấu hình Block Public Access

1. Vẫn trong **Permissions** tab
2. Scroll xuống **Block public access (bucket settings)**
3. Click **Edit**
4. **Uncheck** các options sau (nếu cần public read):
   - ☐ Block all public access
   - ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through new public bucket or access point policies
   - ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies

**Lưu ý:** Nếu bạn muốn files public (để hiển thị images), cần uncheck. Nếu chỉ muốn private với presigned URLs, giữ nguyên checked.

5. Click **Save changes**
6. Xác nhận bằng cách gõ `confirm`

### ✅ Bước 5: Kiểm tra IAM User và Access Keys

1. Vào **IAM** service
2. **Users** → Tìm user bạn đã tạo (hoặc tạo mới)
3. Kiểm tra **Security credentials** tab
4. Ghi lại:
   - **Access Key ID**: `_________________`
   - **Secret Access Key**: `_________________` (chỉ hiện khi tạo mới, nếu mất phải tạo lại)

**Nếu chưa có IAM User:**
1. Click **Create user**
2. Đặt tên: `custom-tailor-s3-user` (hoặc tên khác)
3. Chọn **Provide user access to the AWS Management Console** → **Programmatic access**
4. Attach policy: **AmazonS3FullAccess** (hoặc tạo custom policy với quyền hạn chế hơn)
5. Tạo user và lưu Access Key ID và Secret Access Key

### ✅ Bước 6: Tạo Custom IAM Policy (Recommended - Optional)

Thay vì dùng `AmazonS3FullAccess`, tạo custom policy với quyền hạn chế:

1. Vào **IAM** → **Policies** → **Create policy**
2. Chọn **JSON** tab
3. Paste policy sau (thay `YOUR-BUCKET-NAME`):

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
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

4. Đặt tên: `CustomTailorS3Policy`
5. Tạo policy
6. Attach policy này vào IAM user thay vì `AmazonS3FullAccess`

### ✅ Bước 7: Cấu hình Environment Variables

Thêm vào file `.env` của custom-tailor-server:

```env
# S3 Configuration (Multi-vendor style - Recommended)
S3_REGION=ap-southeast-1
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key

# Hoặc sử dụng AWS standard naming (cũng được hỗ trợ)
# AWS_REGION=ap-southeast-1
# AWS_S3_BUCKET_NAME=your-bucket-name
# AWS_ACCESS_KEY_ID=your-access-key-id
# AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### ✅ Bước 8: Test Connection

1. Start backend server:
   ```bash
   cd custom-tailor-server
   npm run start:dev
   ```

2. Test S3 connection:
   - Mở Swagger UI: `http://localhost:3001/api/docs`
   - Authorize với JWT token
   - Test endpoint: `GET /upload/test`
   - Hoặc dùng cURL:
     ```bash
     curl -X GET http://localhost:3001/upload/test \
       -H "Authorization: Bearer YOUR_JWT_TOKEN"
     ```

3. Kết quả mong đợi:
   ```json
   {
     "success": true,
     "message": "S3 connection successful!",
     "buckets": [...],
     "currentBucket": "your-bucket-name",
     "region": "ap-southeast-1"
   }
   ```

## Cấu trúc thư mục trong S3

Sau khi upload, files sẽ được tổ chức như sau:

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

## Troubleshooting

### ❌ Lỗi: "Access Denied"
- **Nguyên nhân**: IAM user không có đủ quyền hoặc bucket policy sai
- **Giải pháp**: 
  - Kiểm tra IAM policy đã attach đúng chưa
  - Kiểm tra bucket policy có cho phép IAM user không
  - Kiểm tra Access Key ID và Secret Access Key đúng chưa

### ❌ Lỗi: "Bucket not found"
- **Nguyên nhân**: Tên bucket sai hoặc region sai
- **Giải pháp**: 
  - Kiểm tra tên bucket trong `.env` đúng chưa
  - Kiểm tra region trong `.env` khớp với region của bucket

### ❌ Lỗi: "CORS policy"
- **Nguyên nhân**: CORS chưa được cấu hình hoặc origin không được phép
- **Giải pháp**: 
  - Kiểm tra CORS configuration trong S3 bucket
  - Thêm frontend URL vào AllowedOrigins

### ❌ Files không public
- **Nguyên nhân**: Block Public Access đang bật hoặc bucket policy không cho phép public read
- **Giải pháp**: 
  - Uncheck Block Public Access (nếu cần public)
  - Kiểm tra bucket policy có statement cho phép public read

## Security Best Practices

1. ✅ **Sử dụng Custom IAM Policy** thay vì FullAccess
2. ✅ **Rotate Access Keys** định kỳ (mỗi 90 ngày)
3. ✅ **Enable MFA** cho IAM user (nếu có thể)
4. ✅ **Sử dụng IAM roles** thay vì access keys (cho production)
5. ✅ **Enable versioning** cho bucket (optional)
6. ✅ **Setup lifecycle policies** để tự động xóa files cũ (optional)
7. ✅ **Enable encryption** cho bucket (optional)

## Production Checklist

- [ ] Sử dụng custom IAM policy với quyền hạn chế
- [ ] Enable MFA cho IAM user
- [ ] Rotate access keys định kỳ
- [ ] Setup CloudFront CDN (optional - để tăng tốc độ)
- [ ] Enable versioning cho bucket (optional)
- [ ] Setup lifecycle policies (optional)
- [ ] Enable encryption at rest (optional)
- [ ] Setup monitoring với CloudWatch
- [ ] Sử dụng environment variables khác nhau cho dev/prod
- [ ] Không commit `.env` file vào git

## Tài liệu tham khảo

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Bucket Policy Examples](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html)

