import { Component, OnInit } from '@angular/core';
import { GraphApiService } from '../../services/graph-api.service';
import { Observable } from 'rxjs';
import { Group } from '@microsoft/microsoft-graph-types';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups$: Observable<Group[]>;

  constructor(private graphApiService: GraphApiService) { }

  ngOnInit(): void {
    this.groups$ = this.graphApiService.getGroups()
  }

  

}
