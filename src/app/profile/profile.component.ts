import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
const GRAPH_ENDPOINT_GROUP = 'https://graph.microsoft.com/v1.0/groups?$select=id,displayName';

type ProfileType = {
  givenName?: string,
  surname?: string,
  userPrincipalName?: string,
  id?: string
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: ProfileType|null = null;
  groups: any;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getProfile();
    this.getGroup();
  }

  getProfile() {
    console.log('getProfile() called')
    this.http.get(GRAPH_ENDPOINT)
      .subscribe(profile => {
        this.profile = profile;
      });
  }

  getGroup(){
    this.http.get(GRAPH_ENDPOINT_GROUP).subscribe( result => {
      console.log(`getGroup(): ${result}`);
      this.groups = result;
      // this.defaultGridElement = document.getElementById('defaultGrid') as DataGrid;
      // this.defaultGridElement.rowsData = this.newDataSet(this.groups.value.length, this.groups.value);
    });
}
}
