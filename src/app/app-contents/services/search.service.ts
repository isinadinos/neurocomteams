/**
 * A service responsible for pagination and sorting requests made on Rest Service.
 * Search Service is responsible for preparing search parameters before calling Rest Service for http request.
 **/
import { Injectable } from "@angular/core";
import { SearchObject, SearchParameters } from "../models_interfaces";
import { Observable } from "rxjs";
import { RestService } from "./rest.service";
import { PageEvent } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private path: string;
  private searchObject: SearchObject;
  private searchParams: SearchParameters = {};
  private prevPagSize = 25; //default page size

  constructor(private restService: RestService) {}

  //path: refers to 'linkKey' used by Rest Service in order to create the url
  //obj: refers to the object that has information for search query process
  //params: refer to parameters like page size, sort order etc that are used during searching
  search(path: string, obj: SearchObject, params?: boolean): Observable<any> {
    if (params) {
      //console.log("onSearch: ", this.searchParams);
      return this.restService.getSearchResults(path, obj, this.searchParams);
    } else {
      return this.restService.getSearchResults(path, obj);
    }
  }

  onPaginationChange(
    event: PageEvent,
    path: string,
    obj: SearchObject
  ): Observable<any> {
    this.searchParams.page =
      event.pageSize === this.prevPagSize ? event.pageIndex : 0;
    this.searchParams.size = event.pageSize;
    this.prevPagSize = event.pageSize;
    return this.search(path, obj, true);
  }

  onInfoPaginationChange(event: PageEvent, path: string): Observable<any> {
    this.searchParams.page =
      event.pageSize === this.prevPagSize ? event.pageIndex : 0;
    this.searchParams.size = event.pageSize;
    this.prevPagSize = event.pageSize;

    return this.restService.getRequestInfo(path, null, this.searchParams, null);
  }

  sortData(
    sort: Sort,
    path: string,
    obj: SearchObject
  ): null | Observable<any> {
    //if(sort.direction === ''){ return null;}
    this.resetPageParams();
    if (sort != null) {
      this.searchParams.sort = sort.active;
      this.searchParams.asc = sort.direction;
    }
    return this.search(path, obj, sort == null ? false : true);
  }

  resetPageParams() {
    this.searchParams.page = 0;
    this.prevPagSize = 25;
    this.searchParams.size = 25;
  }

  //every component should clear the searchParams in its ngOnInit()
  clearSearchParams() {
    this.searchParams = {};
  }
}
