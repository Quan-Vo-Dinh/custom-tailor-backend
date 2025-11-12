import { Injectable, type NestInterceptor, type ExecutionContext, Logger } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger("HttpRequest")

  intercept(context: ExecutionContext, next): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const startTime = Date.now()

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime
        this.logger.log(`${method} ${url} - ${duration}ms`)
      }),
    )
  }
}
