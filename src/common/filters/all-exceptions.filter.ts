import { type ExceptionFilter, Catch, type ArgumentsHost, HttpStatus, Logger } from "@nestjs/common"
import type { Request, Response } from "express"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger("AllExceptionsFilter")

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = "Internal server error"

    if (exception instanceof Error) {
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
    })
  }
}
