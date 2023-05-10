import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
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
import { catchError, filter } from 'rxjs';

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
    private teamsService: TeamsService,
    private msalBroadcastService: MsalBroadcastService
    ) {

  }


  ngOnInit(): void {
    console.log('init home component')
    console.log(JSON.stringify(this.msalService.instance.getAllAccounts))
    console.log(JSON.stringify(this.msalService.instance.getActiveAccount))
    // if(this.msalService.instance.getAllAccounts.length == 0){
    //   this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
    // }

  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null
  }

  callProfile () {
    console.log("Calling profile...");
    this.http.get("https://graph.microsoft.com/v1.0/me").subscribe(
      resp  => {
        console.log("Calling profile... got response");
        this.apiResponse = resp;
      },
      error => {
        console.error('error caught in component')
        console.log(error?.message)
        throw error;
      }
    )
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
      name: data?.displayName
    };
  }

  getName() : string | undefined{
    if (this.msalService.instance.getActiveAccount() == null) {
      return 'unknown'
    }
    return this.msalService.instance.getActiveAccount()?.username
  }

  logout() {
    this.msalService.logout()
  }



}

export interface groupsData {
  id: string,
  displayName: string
}
