import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from "@nestjs/common"
import type { Request, Response } from "express"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger("AllExceptionsFilter")

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = "Internal server error"
    let responseBody: unknown = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse()
      responseBody = res
      if (typeof res === "string") {
        message = res
      } else if (res && typeof res === "object" && "message" in res) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message = (res as any).message ?? message
      } else {
        message = exception.message
      }
      this.logger.error(`HTTP Exception: ${message}`, exception.stack)
    } else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(`Unhandled Exception: ${message}`, exception.stack)
    } else {
      this.logger.error(`Unhandled Exception:`, exception)
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(responseBody && typeof responseBody === "object" ? responseBody : {}),
    })
  }
}
