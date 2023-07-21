import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, ValidationErrors } from "@angular/forms";
import { FieldConfig } from "../fields-interface";

@Component({
  selector: "app-input",
  template: `
    <mat-form-field
      [formGroup]="group"
      fxFlex
      [ngStyle]="{ width: 'calc(' + myWidth + ')' }"
    >
      <mat-placeholder class="placeholder">{{
        field.label | i18next
      }}</mat-placeholder>
      <input matInput [formControlName]="field.name" [type]="field.inputType" />

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
      <ng-container
        *ngFor="let validation of field.asyncValidations"
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
export class InputComponent implements OnInit {
  @Input() field: FieldConfig;
  @Input() group: FormGroup;
  @Input() rowSize: number;
  public myWidth: string;

  constructor() {}

  ngOnInit() {
    if (this.rowSize == 1) {
      this.myWidth = 60 + "%";
    } else {
      this.myWidth = 100 / this.rowSize + "% - " + 40 + "px";
    }
  }

  /*
    displayError is used so that only 1 error will be displayed each time.
    One field might have multiple errors, only the first will be chosen to get displayed
  */
  displayError(fieldId: string, currentError: string) {
    const controlErrors: ValidationErrors = this.group.get(fieldId).errors;
    let toDisplay = Object.keys(controlErrors)[0]; //display only one validation error each time
    return toDisplay == currentError;
  }
}
