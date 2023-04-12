import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { TeamsService } from '../teams.service';
import {
  provideFluentDesignSystem,
  fluentTab,
  fluentTabPanel,
  fluentTabs,
  fluentButton,
  fluentTextArea
} from "@fluentui/web-components";

provideFluentDesignSystem().register(fluentTab(), fluentTabPanel(), fluentTabs(), fluentButton(), fluentTextArea());

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  apiResponse: string | undefined;
  name = '';
  groups: any;

  constructor(
    private msalService: MsalService,
    private http: HttpClient,
    private teamsService: TeamsService
    ) {

    }

  ngOnInit(): void {
    if(this.msalService.instance.getAllAccounts.length == 0){
      this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
    }
    //this.getAccessTokenAndCallGraphAPI();
    // this.msalService.instance.handleRedirectPromise().then( res => {
    //   if (res != null && res.account != null) {
    //     this.msalService.instance.setActiveAccount(res.account)
    //   }
    // })
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null
  }

  callProfile () {
    this.http.get("https://graph.microsoft.com/v1.0/me").subscribe( resp  => {
      this.apiResponse = JSON.stringify(resp)
    })
  }

  getAccessTokenAndCallGraphAPI(){

    // this.msalService.acquireTokenSilent({
    //   scopes: ['group.Read.All']
    // }).subscribe( (result : any |undefined) => {
    //   const httpOptions = {
    //     headers: new HttpHeaders({
    //       'Content-Type':  'application/json',
    //       Authorization: 'Bearer '+result.accessToken
    //     })}

      this.http.get("https://graph.microsoft.com/v1.0/groups?$select=id,displayName").subscribe( result => {
        console.log(result);
        this.groups = JSON.stringify(result);
      });
    // })
  }

  getName () : string | undefined{
    if (this.msalService.instance.getActiveAccount() == null) {
      return 'unknown'
    }

    return this.msalService.instance.getActiveAccount()?.name
  }

  logout() {
    this.msalService.logout()
  }

  login() {
    this.msalService.loginPopup()
      .subscribe((response: AuthenticationResult) => {
        this.msalService.instance.setActiveAccount(response.account);
      });
  }



}
