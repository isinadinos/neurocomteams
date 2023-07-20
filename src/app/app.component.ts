import { Component, OnDestroy, Inject, OnInit } from "@angular/core";
import { Observable, Subject, Subscription, filter, takeUntil } from "rxjs";
import { CommonService } from "./app-contents/services/common.service";
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType, PopupRequest, RedirectRequest, SsoSilentRequest } from '@azure/msal-browser';
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  supersetLoginUrl$: Observable<any>;

  title = "Angular Template";
  subscriptionMsg: Subscription;
  subscriptionSpinner: Subscription;

  showErr = false;
  msg: string = "";
  details: string = "";
  msgHeader: string = "";
  msgIcon: string = "";
  type: string = "";
  loading = false;

  private readonly _destroying$ = new Subject<void>();

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
  private authService: MsalService,
  private msalBroadcastService: MsalBroadcastService,
  public router: Router,
    private comServ: CommonService,
  ) {
    //subscription for receiving spinner signals
    this.subscriptionSpinner = this.comServ.getLoading().subscribe((value) => {
      this.loading = value;
    });
    //subscription for receiving messages
    // we receive both message content and type => for css styling
    this.subscriptionMsg = this.comServ.getMessage().subscribe((message) => {
      this.msg = message.text;
      this.details = message.details;
      this.type = message.type;
      switch (this.type) {
        case "S":
          this.msgHeader = "Success";
          this.msgIcon = "check_circle";
          break;
        case "W":
          this.msgHeader = "Warning";
          this.msgIcon = "warning";
          break;
        case "I":
          this.msgHeader = "Information";
          this.msgIcon = "info";
          break;
        case "D":
          this.msgHeader = "Error";
          this.msgIcon = "error";
          break;
        default:
        //nothing else
      }
    });
  }

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
        this.router.navigate([""])
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loading = false;
    });
  }

  ngOnDestroy() {
    /*Always unsibsribe from observables
     * Note: Async pipe subscribes and unsubscribes automatically.
     * Http Request unsubscriptions are also made automatically.
     * Other cases require unsubscribe().
     */

    this._destroying$.next(undefined);
    this._destroying$.complete();

    this.subscriptionMsg.unsubscribe();
    this.subscriptionSpinner.unsubscribe();
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

  clearMsgError() {
    this.comServ.clearMessage();
  }
}
