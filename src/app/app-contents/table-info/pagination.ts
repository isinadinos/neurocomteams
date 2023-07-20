import { Component, OnInit, Input, Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { PageResults } from "../models_interfaces";

/*
 * Pagination component used by pages that need it
 */

@Component({
  selector: "app-pagination",
  template: `
    <mat-paginator
      #pagination
      [length]="
        this.searchPageInfo?.totalElements
          ? this.searchPageInfo.totalElements
          : 0
      "
      [pageSize]="this.searchPageInfo?.size ? this.searchPageInfo.size : 25"
      [pageIndex]="this.searchPageInfo?.number ? this.searchPageInfo.number : 0"
      [pageSizeOptions]="[10, 25, 50, 100]"
      [showFirstLastButtons]="true"
      (page)="onPagination($event)"
    >
    </mat-paginator>
  `,
})
export class PaginationComponent implements OnInit {
  //It receives page information of results that will be displayed in table
  @Input() searchPageInfo: PageResults;
  //It emits an event when user presses a pagination button
  @Output() paginationEvent = new EventEmitter<PageEvent>();

  constructor() {}

  ngOnInit() {}

  onPagination(event: PageEvent) {
    this.paginationEvent.emit(event);
  }
}
