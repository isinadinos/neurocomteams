import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, finalize, Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InterceptorService implements HttpInterceptor {
  private static pendingRequests: number = 0;

  constructor() {}

  private ignoreRequest(req: HttpRequest<any>): boolean {
    if (req.method == "HEAD") {
      return true;
    }

    return false;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.ignoreRequest(req)) {
      return next.handle(req);
    }

    this.increasePendingRequests();

    return next.handle(req).pipe(
      finalize(() => {
        this.decreasePendingRequests();
      })
    );
  }

  hasPendingRequests() {
    return InterceptorService.pendingRequests > 0;
  }

  increasePendingRequests() {
    InterceptorService.pendingRequests += 1;
  }

  decreasePendingRequests() {
    InterceptorService.pendingRequests -= 1;
  }
}
