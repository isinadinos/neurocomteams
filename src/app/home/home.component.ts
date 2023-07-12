import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult } from '@azure/msal-browser';
import { catchError, filter, tap } from 'rxjs/operators';
import { GraphApiService } from '../service/graph-api.service';
import { User } from '@microsoft/microsoft-graph-types';
import { Group } from '@microsoft/microsoft-graph-types';
import { DataGrid } from '@fluentui/web-components';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  profile: User|null = null;
  groups: Array<Group>|null = null;

  defaultGridElement: DataGrid | null = null;

  constructor(private authService: MsalService, private msalBroadcastService: MsalBroadcastService, private graphApiService: GraphApiService) { }

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
        this.setLoginDisplay();
      });
      this.setLoginDisplay();
  }

  getProfile(){
    this.graphApiService.getProfile().pipe(tap(res => {
      this.profile = res;
    }), catchError(err => {
      console.error(err)
      throw err;
    })).subscribe();
  }

  getGroups(){
    this.graphApiService.getGroup().pipe(tap((res: any) => {
      this.groups = <Array<Group>>res.value;
      console.log(`groups= ${JSON.stringify(this.groups, null, 2)}`)
      this.defaultGridElement = document.getElementById('defaultGrid') as DataGrid;
      this.defaultGridElement.rowsData = this.newDataSet(this.groups.length, this.groups);
    }), catchError(err => {
      console.error(err)
      throw err;
    })).subscribe();
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }


  private newDataSet(rowCount: number, data: Group[]): object[] {
    const newRows: object[] = [];
    for (let i = 0; i <= rowCount; i++) {
      if (data[i] && data[i].id != undefined && data[i].id != null){
        newRows.push(this.newDataRow(`${i + 1}`, data[i]));
      }
    }
    return newRows;
  }

  private newDataRow(id: string, data: Group): object {
    return {
      index: id,
      id: data?.id,
      name: data?.displayName,
      descr: data?.description,
      mail: data?.mail,
      visibility: data?.visibility,
    };
  }

}
