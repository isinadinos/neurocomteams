import { MatPaginatorIntl } from "@angular/material/paginator";
import { Injectable } from "@angular/core";
import i18next from "i18next";

//Information at: https://stackoverflow.com/questions/53646259/how-to-customize-mat-paginator-in-angular-material
//https://material.angular.io/components/paginator/api#MatPaginator
@Injectable()
export class CustomMatPagination extends MatPaginatorIntl {
  firstPageLabel = i18next.t("project.pagination.firstPage");
  lastPageLabel = i18next.t("project.pagination.lastPage");
  nextPageLabel = i18next.t("project.pagination.nextPage");
  previousPageLabel = i18next.t("project.pagination.previousPage");

  getRangeLabel = function (page: number, pageSize: number, length: number) {
    if (length >= 0) {
      let number =
        (page + 1) * pageSize < length ? (page + 1) * pageSize : length;
      let s = i18next.t("project.pagination.totalResults", {
        startIndex: length > 0 ? page * pageSize + 1 : 0,
        endIndex: number,
        total: length,
      });
      return s;
    } else {
      let s1 = i18next.t("project.pagination.results", {
        startIndex: page * pageSize + 1,
        endIndex: page * pageSize + -length,
      });
      return s1;
    }
  };

  itemsPerPageLabel = i18next.t("project.pagination.itemsPerPage") + ": ";
}
