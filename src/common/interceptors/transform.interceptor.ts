import { Injectable, type NestInterceptor, type ExecutionContext } from "@nestjs/common"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    )
  }
}
