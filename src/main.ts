import { NestFactory } from "@nestjs/core";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as express from "express";
import { join } from "path";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize filters
  const filters = [new HttpExceptionFilter(), new AllExceptionsFilter()];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters.forEach((filter: any) => {
    app.useGlobalFilters(filter);
  });

  // Initialize interceptors
  const interceptors = [new LoggingInterceptor(), new TransformInterceptor()];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interceptors.forEach((interceptor: any) => {
    app.useGlobalInterceptors(interceptor);
  });

  // Initialize validation
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors
        .map(
          (err) =>
            `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`
        )
        .join("; ");
      return new BadRequestException(messages);
    },
  });
  app.useGlobalPipes(validationPipe);

  // Initialize Swagger
  const config = new DocumentBuilder()
    .setTitle("Custom Tailor API")
    .setDescription("Backend API for Custom Tailor E-commerce Platform")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Initialize CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Health check and root endpoints
  const expressApp = app.getHttpAdapter().getInstance();

  // Serve static files from /public folder (for product images)
  // Using express.static directly to handle Vietnamese characters in filenames
  const publicPath = join(process.cwd(), "public");
  expressApp.use("/images", express.static(join(publicPath, "images")));
  console.log(`Serving static files from: ${publicPath}`);

  // Root endpoint - redirect to API docs
  expressApp.get("/", (_req, res) => {
    res.redirect("/api/docs");
  });

  // Health check endpoint
  expressApp.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
