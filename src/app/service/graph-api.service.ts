import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

@Injectable({
  providedIn: 'root'
})
export class GraphApiService {

  constructor(private http: HttpClient) { }

  getProfile() {
    return this.http.get(`${GRAPH_ENDPOINT}/me`);
  }

  getGroup(){
    return this.http.get(`${GRAPH_ENDPOINT}/groups`);
}
}