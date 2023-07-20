import { Injectable, Injector } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  CanActivateChild,
  CanDeactivate,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { RestService } from "../services/rest.service";
import { AuthenticationService } from "../services/authentication.service";
import { catchError, map } from "rxjs/operators";
import { AppPermissions } from "../model/enum/app-permissions";

//A guard that checks if a user is authorized to access a page (as admin etc).
@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(private restService: RestService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.restService.getAuthorities().pipe(
      map((resp) => this.changeNavPath(resp[AppPermissions.ADMIN])),
      catchError((err) => of(this.changeNavPath(false)))
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

//A guard that checks if user is loggedIn, in order to allow access to a page.
@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    //guarding with http.rest requests
    return this.authService.isAuthenticated().pipe(
      map((resp) => this.changeNavPath(resp[0])),
      catchError((err) => of(this.changeNavPath(err[0])))
    );

    // .toPromise()
    // .then(resp => this.changeNavPath(resp[0]))
    // .catch(err => this.changeNavPath(err[0]));
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

//A guard that redirects user to home page if s/he is logged in and tries to access login page
@Injectable({
  providedIn: "root",
})
export class NonAuthGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated().pipe(
      map((resp) => this.changeNavPath(!resp[0])),
      catchError((err) => of(this.changeNavPath(!err[0])))
    );
  }

  private changeNavPath(redirect: boolean): boolean {
    if (!redirect) {
      this.router.navigate(["home"]);
    }
    return redirect;
  }
}

//Master Guard combines a set of guards that need to be applied on a page (in case the page needs to be guarded by more that one guards).
@Injectable({
  providedIn: "root",
})
export class MasterGuard implements CanActivate, CanActivateChild {
  constructor(private injector: Injector) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    let guards = route.data.guards || [];
    for (let guard of guards) {
      let instance: CanActivate = this.injector.get(guard);
      let result = await instance.canActivate(route, state); // awaits for a promise to return
      if (result === false || result instanceof UrlTree) {
        return result; //if one of the guards return false, stop checking (user is not authorized to access page)
      }
    }
    return true;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return this.canActivate(route, state);
  }
}

//A guard that checks when user tries to leave a page. Useful when there are unsaved pages
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

//in order to make the guard reusable, we check if a component implements canDeactivate method
//every component that needs this guard will have a canDeactivate method implemented
@Injectable({
  providedIn: "root",
})
export class DialogGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
