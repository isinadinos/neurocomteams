import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AppPermissions } from "../model/enum/app-permissions";
import { RestService } from "../services/rest.service";

@Injectable({
  providedIn: "root",
})
export class UserManagementGuard implements CanActivate, CanActivateChild {
  constructor(private restService: RestService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.restService.getAuthorities().pipe(
      map((resp) => this.changeNavPath(resp[AppPermissions.USER_MANAGEMENT])),
      catchError(() => of(this.changeNavPath(false)))
    );
  }

  private changeNavPath(redirect: boolean): boolean {
    if (!redirect) {
      this.router.navigate(["login"]);
    }
    return redirect;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
