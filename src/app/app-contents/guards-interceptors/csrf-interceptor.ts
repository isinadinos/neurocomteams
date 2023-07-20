/*
 * Implementation of HttpInterceptor that adds csrf tokens inside request headers.
 * This also includes functionality that checks error codes and sends appropriate messages or redirects to certain locations
 */

import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
} from "@angular/common/http";
import { CommonService } from "../services/common.service";
import { Router } from "@angular/router";

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private csrfToken;
  private errorCode;
  private loadingCount = 0;

  getCSRF() {
    return this.csrfToken;
  }

  constructor(private comServ: CommonService, private router: Router) {}

  //pass csrf token from http.head request to http.post
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if(++this.loadingCount === 1) this.comServ.updateLoading(true); //for remote spinner => new request = start loader

    if (
      req.method === "POST" ||
      (req.method == "PATCH" && this.csrfToken != null)
    ) {
      req = req.clone({
        setHeaders: {
          "X-CSRF-TOKEN": this
            .csrfToken /*, 'Content-Type': 'application/json'*/,
        },
      });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && --this.loadingCount === 0) {
          //this.comServ.updateLoading(false); //for remote spinner => new request = start loader
        }
        if (
          event instanceof HttpResponse &&
          event.headers.get("_csrf") != null
        ) {
          this.csrfToken = event.headers.get("_csrf");
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        //if(--this.loadingCount === 0) this.comServ.updateLoading(false); //for remote spinner => response = stop loader
        if (error.headers.get("_csrf") != null) {
          this.csrfToken = error.headers.get("_csrf");
        }
        //-------------------Checking specific error codes ------------------------------------------------------------

        this.errorCode = error.headers.get("error.code");

        switch (error.status) {
          case 401: //case 401 probably will not occur due to guards
            if (
              this.errorCode == "password.expired" ||
              this.errorCode == "password.tochange"
            ) {
              this.comServ.sendMessage(this.errorCode, "D");
              this.router.navigate(["reset/out"]);
            } else {
              this.errorCode =
                this.errorCode != null &&
                this.errorCode != "" &&
                this.errorCode != undefined
                  ? this.errorCode
                  : "password.invalid";
              this.comServ.sendMessage(this.errorCode, "D");
              this.router.navigate(["login"]);
            }
            break;
          case 403:
            if (
              this.errorCode != null &&
              this.errorCode != undefined &&
              this.errorCode != ""
            ) {
              this.comServ.sendMessage(this.errorCode, "D");
            }
            if (
              this.errorCode == "password.expired" ||
              this.errorCode == "password.tochange"
            ) {
              this.router.navigate(["reset/out"]);
            } else {
              if (this.router.url != "/reset/out") {
                //if user is logged out and was redirected at reset page, s/he should stay there
                // this.router.navigate(['login']);                                  // if user is logged in, then s/he should redirect
              }
            }
            break;
          case 500:
            this.comServ.sendMessage("Παρουσιάστηκε εσωτερικό σφάλμα!", "D"); //should this be handled by services (?)
            //this.errorCode = "Παρουσιάστηκε εσωτερικό σφάλμα!"
            break;
          case 404:
            break;
          default:
          //do nothing
        }
        throw [error, this.errorCode ? this.errorCode : ""];
      })
    );
  }
}
