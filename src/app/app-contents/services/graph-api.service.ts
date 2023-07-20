import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '@microsoft/microsoft-graph-types';
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

  getGroups(): Observable<Group[]>{
    return this.http.get(`${GRAPH_ENDPOINT}/groups`).pipe(map((res: any)=> {return <Array<Group>>res.value}));
  }
}
