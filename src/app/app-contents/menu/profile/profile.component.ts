import { Component, OnInit } from '@angular/core';
import { User } from '@microsoft/microsoft-graph-types';
import { Observable } from 'rxjs';
import { GraphApiService } from '../../services/graph-api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user$: Observable<User>;

  constructor(private graphApiService: GraphApiService) { }

  ngOnInit(): void {
    this.user$ = this.graphApiService.getProfile();

  }

}
