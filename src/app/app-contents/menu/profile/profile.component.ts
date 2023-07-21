import { Component, OnInit } from '@angular/core';
import { AppRoleAssignment, Calendar, DirectoryObject, Event, User } from '@microsoft/microsoft-graph-types';
import { Observable, tap } from 'rxjs';
import { GraphApiService } from '../../services/graph-api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user$: Observable<User>;
  memberOf$: Observable<DirectoryObject[]>;
  appRoleAssignments$: Observable<AppRoleAssignment[]>;
  calendars$: Observable<Calendar[]>;
  events$: Observable<Event[]>;

  constructor(private graphApiService: GraphApiService) { }

  ngOnInit(): void {
    this.user$ = this.graphApiService.getProfile();
    this.memberOf$ = this.graphApiService.getMemberOf();
    this.appRoleAssignments$ = this.graphApiService.getAppRoleAssignment();
    this.calendars$ = this.graphApiService.getCalendars();
    this.events$ = this.graphApiService.getEvents();
  }



}
