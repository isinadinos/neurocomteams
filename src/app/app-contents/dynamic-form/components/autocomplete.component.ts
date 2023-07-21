import { Component, OnInit, Input } from "@angular/core";
import { Observable, of } from "rxjs";
import {
  startWith,
  map,
  flatMap,
  tap,
  distinctUntilChanged,
  debounceTime,
} from "rxjs/operators";
import { FieldConfig } from "../fields-interface";
import { FormGroup, ValidationErrors } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { RestService } from "../../services/rest.service";

//https://blog.angular-university.io/angular-host-context/

@Component({
  selector: "app-autocomplete",
  template: `
    <mat-form-field
      [formGroup]="group"
      fxFlex
      [ngStyle]="{ width: 'calc(' + myWidth + ')' }"
    >
      <input
        matInput
        [type]="field.inputType"
        [formControlName]="field.name"
        [matAutocomplete]="auto"
      />
      <mat-placeholder class="placeholder">{{
        field.label | i18next
      }}</mat-placeholder>
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayFn.bind(this)"
      >
        <mat-option
          *ngFor="let item of filteredOptions | async"
          [value]="item.id"
        >
          {{ item.code }}
        </mat-option>
      </mat-autocomplete>
      <button
        mat-button
        *ngIf="group.get(field.name).value"
        matSuffix
        mat-icon-button
        aria-label="Clear"
        (click)="
          group.controls[field.name].setValue(''); $event.stopPropagation()
        "
      >
        <mat-icon>close</mat-icon>
      </button>

      <ng-container
        *ngFor="let validation of field.validations"
        ngProjectAs="mat-error"
      >
        <mat-error
          *ngIf="
            group.get(field.name).hasError(validation.name) &&
            displayError(field.name, validation.name)
          "
        >
          {{ validation.message | i18next }}
        </mat-error>
      </ng-container>
    </mat-form-field>
  `,
  styles: [
    `
      .mat-form-field,
      .mat-form-field.text {
        padding: 5px;
        margin-left: 15px;
        margin-right: 15px;
      }

      @media screen and (max-width: 992px) {
        .mat-form-field,
        .mat-form-field.text {
          min-width: calc(100% - 40px);
          padding: 10px;
        }
      }
    `,
  ],
})
export class AutocompleteComponent implements OnInit {
  filteredOptions: Observable<string[]>;
  options: any;
  @Input() field: FieldConfig;
  @Input() group: FormGroup;
  @Input() rowSize: number;
  public myWidth: string;

  constructor(private http: HttpClient, private rest: RestService) {}

  ngOnInit() {
    if (this.rowSize == 1) {
      this.myWidth = 60 + "%";
    } else {
      this.myWidth = 100 / this.rowSize + "% - " + 40 + "px";
    }
    this.options = this.field.options;
    this.filteredOptions = this.getFilteredOptions();
  }

  //----------------------- testing if we get options from server ----------------------------------

  /*
   *If we get our list options from http request on server, when user types something
   * then (at first) we will return an empty table. If we have gotten our select options
   * from page that uses dynamic form then we already have a non empty array of options (this.field.options)
   */
  getOptions() {
    return this.field.url ? [] : this.field.options;
  }

  //https://www.learnrxjs.io/operators/filtering/debouncetime.html
  //https://www.learnrxjs.io/operators/filtering/distinctuntilchanged.html

  getFilteredOptions(): Observable<string[]> {
    if (this.field.url) {
      return this.group.get(this.field.name).valueChanges.pipe(
        startWith(""),
        debounceTime(1000),
        distinctUntilChanged(),
        flatMap((value) => {
          return this._observableFilter(value);
        })
      );
    } else {
      return this.group.get(this.field.name).valueChanges.pipe(
        startWith(""),
        map((value) => {
          return this._filter(value);
        })
      );
    }
  }

  /*
* _observableFilter will make an http request if url is given and then return an observable with results
* otherwise it will return this.options array filtered based on value parameter
*http request should return an array of {id : "xxxx", value: "xxx"}
*otherwise we should make this array here inside a map() and then
*assign result to this.options.
*Note: We can either make an http request via restService.getSearchResult (given suitable url) (e.g.

   return this.rest.getSearchResults(this.field.url, {operator:  'OR', operands: {'options' : filterValue}}).pipe(
            map(res => {this.options = res; return res}),
            map(res => {return res.filter(option => option.code.toLowerCase())}))

*or make a direct request using httpClient like
    return this.http.get(this.field.url, {'data' : filterValue}).pipe(...)

*Based on what is decided, this.field.url should be in respective format
*
*Note {id:"xxx", value: "xxx"} -> 'id' and 'value' would be preferred to have the same or similar value as matInput displays 'id' while
*select list displays 'value', if they are too different it might confuse viewers
*/
  private _observableFilter(value: string): Observable<any[]> {
    if (value == null || value == "" || value == undefined) {
      this.options = [];
      return this.options;
    }
    const filterValue = value.toString().toLowerCase(); //lowerCase might not be necessary
    return of(dummyOptions).pipe(
      //<-- this is dummy data, should be replaced with http request
      map((res) => {
        return res.filter((option) =>
          option.code.toLowerCase().includes(filterValue)
        );
      }), //in theory filtering http request won't be needed as we get only data that match what user typed
      tap((res) => console.log("sent request to server"))
    );
  }

  private _filter(value: string): string[] {
    if (value == null || value == "" || value == undefined) return this.options;
    const filterValue = value.toString().toLowerCase();
    return this.options.filter((option) =>
      option.code.toLowerCase().includes(filterValue)
    );
  }

  //------------------------------------------------------------------------------------------------

  displayError(fieldId: string, currentError: string) {
    const controlErrors: ValidationErrors = this.group.get(fieldId).errors;
    let toDisplay = Object.keys(controlErrors)[0];
    return toDisplay == currentError;
  }

  displayFn(value?: string) {
    return this.options != null && this.options.length > 0
      ? this.options.find((x) => x.id === value)?.code
      : null;
  }
}

//*--------------------Original autocomplete  implementation-----------------------------
// Implementation that is not depended on http request to get dropdown list options
/*ngOnInit() {
  if(this.rowSize == 1){
    this.myWidth = 60 +"%"
  }else{
    this.myWidth = (100/(this.rowSize))+"% - "+ 40 +"px";
  }
  this.options = this.field.options
  this.filteredOptions = this.group.get(this.field.name).valueChanges.pipe(
      startWith(''),
      map(value => {return this._filter(value)})
    )
}

private _filter(value: string): string[] {
  if(value == null || value == '' || value == undefined) return this.options;
  const filterValue = value.toString().toLowerCase();
  return this.options.filter(option => option.code.toLowerCase().includes(filterValue));
}*/

export const dummyOptions = [
  { id: "id1", code: "code1" },
  { id: "id2", code: "code2" },
  { id: "id3", code: "code3" },
  { id: "id4", code: "code4" },
];
