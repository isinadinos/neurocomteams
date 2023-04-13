import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { TeamsService } from '../teams.service';
import {
  provideFluentDesignSystem,
  fluentTab,
  fluentTabPanel,
  fluentTabs,
  fluentButton,
  fluentTextArea,
  fluentDataGridCell,
  fluentDataGridRow,
  fluentDataGrid,
  DataGrid,
  fluentCard
} from "@fluentui/web-components";

provideFluentDesignSystem().register(fluentTab(), fluentTabPanel(), fluentTabs(), fluentButton(), fluentTextArea(),
  fluentDataGridCell(),fluentDataGridRow(),fluentDataGrid(), fluentCard()
);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  apiResponse: any;
  name = '';
  groups: any;

  defaultGridElement: DataGrid | null = null;

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
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null
  }

  callProfile () {
    this.http.get("https://graph.microsoft.com/v1.0/me").subscribe( resp  => {
      // this.apiResponse = JSON.stringify(resp);
      this.apiResponse = resp;
    })
  }

  getAccessTokenAndCallGraphAPI(){
      this.http.get("https://graph.microsoft.com/v1.0/groups?$select=id,displayName").subscribe( result => {
        console.log(result);
        this.groups = result;
        this.defaultGridElement = document.getElementById('defaultGrid') as DataGrid;
        this.defaultGridElement.rowsData = this.newDataSet(this.groups.value.length, this.groups.value);
      });
  }

 newDataSet(rowCount: number, data: groupsData[]): object[] {
    const newRows: object[] = [];
    for (let i = 0; i <= rowCount; i++) {
      if (data[i] && data[i].id != undefined && data[i].id != null){
        newRows.push(this.newDataRow(`${i + 1}`, data[i]));
      }
    }
    return newRows;
  }

 newDataRow(id: string, data: groupsData): object {
    return {
      index: `${id}`,
      id: data?.id,
      name: data?.displayName,
    };
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

export interface groupsData {
  id: string,
  displayName: string
}
