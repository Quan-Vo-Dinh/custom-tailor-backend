import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException, Logger } from "@nestjs/common"
import type { Request, Response } from "express"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger("HttpExceptionFilter")

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof exceptionResponse === "object" ? (exceptionResponse as any).message : exceptionResponse,
    }

    if (status >= 500) {
      this.logger.error(`HTTP ${status} Error: ${JSON.stringify(errorResponse)}`, exception.stack)
    } else {
      this.logger.warn(`HTTP ${status} Error: ${JSON.stringify(errorResponse)}`)
    }

    response.status(status).json(errorResponse)
  }
}
