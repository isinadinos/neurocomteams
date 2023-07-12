import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType, PopupRequest, RedirectRequest, SsoSilentRequest } from '@azure/msal-browser';
import { StandardLuminance } from '@fluentui/web-components';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // isIframe = false;
  // loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    public router: Router
  ) { }

  ngOnInit(): void {
    // this.isIframe = window !== window.parent && !window.opener;
    this.loginSSO();

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => {
          console.log(`NEURO: status=${status}`)
          return status === InteractionStatus.None
        }),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.router.navigate(["home"])
      });
  }

  // setLoginDisplay() {
  //   console.log(`NEURO: getAllAccounts()=${JSON.stringify(this.authService.instance.getAllAccounts(), null, 2)}`)
  //   this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  // }

  /**
   * @deprecated
   * Performs login using Redirect or Popup.
   * This does not work from within teams application. Instead we should use loginSSO()
   */
  login() {
    console.log('NEURO: login()')
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      console.log('NEURO: interactionType=POPUP')
      if (this.msalGuardConfig.authRequest) {
        console.log('NEURO: authRequest')
        this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            console.log(`NEURO: ${JSON.stringify(response, null, 2)}`)
            this.authService.instance.setActiveAccount(response.account);
            // this.setLoginDisplay();
          });
      } else {
        console.log('NEURO: else')
        this.authService.loginPopup()
          .subscribe((response: AuthenticationResult) => {
            console.log(`NEURO: ${JSON.stringify(response, null, 2)}`)
            this.authService.instance.setActiveAccount(response.account);
            // this.setLoginDisplay();
          });
      }
    } else {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
      } else {
        this.authService.loginRedirect();
      }
    }
  }

  loginSSO(){
    console.log('NEURO: loginSSO()')
    const silentRequest: SsoSilentRequest = {
    }

    this.authService.ssoSilent(silentRequest)
      .subscribe({
        next: (result: AuthenticationResult) => {
          console.log("NEURO: SsoSilent succeeded!");
        }, 
        error: (error) => {
          console.log(`NEURO: SsoSilent Failed! Error=${JSON.stringify(error, null,2)}`)
          this.authService.loginPopup();
        }
      });
  }

  logout() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/"
      });
    } else {
      this.authService.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
