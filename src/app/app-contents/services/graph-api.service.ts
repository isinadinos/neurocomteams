import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppRoleAssignment, Calendar, DirectoryObject, Event, User } from '@microsoft/microsoft-graph-types';
import { Group } from '@microsoft/microsoft-graph-types';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

@Injectable({
  providedIn: 'root'
})
export class GraphApiService {

  constructor(private http: HttpClient) { }

  getProfile(): Observable<User>{
    return this.http.get(`${GRAPH_ENDPOINT}/me`);
  }

  getMemberOf(): Observable<DirectoryObject[]>{
    return this.http.get(`${GRAPH_ENDPOINT}/me/memberOf`).pipe(map((res: any)=> {return <Array<DirectoryObject>>res.value}));
  }

  getAppRoleAssignment(): Observable<AppRoleAssignment[]>{
    return this.http.get(`${GRAPH_ENDPOINT}/me/appRoleAssignments`).pipe(map((res: any)=> {return <Array<AppRoleAssignment>>res.value}));
  }

  getCalendars(): Observable<Calendar[]>{
    return this.http.get(`${GRAPH_ENDPOINT}/me/calendars`).pipe(map((res: any)=> {return <Array<Calendar>>res.value}));
  }

  getEvents(): Observable<Event[]>{
    return this.http.get(`${GRAPH_ENDPOINT}/me/events`).pipe(map((res: any)=> {return <Array<Event>>res.value}));
  }

  getGroups(): Observable<Group[]>{
    return this.http.get(`${GRAPH_ENDPOINT}/groups`).pipe(map((res: any)=> {return <Array<Group>>res.value}));
  }
}
