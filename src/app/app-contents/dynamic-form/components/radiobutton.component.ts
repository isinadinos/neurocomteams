import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, ValidationErrors } from "@angular/forms";
import { FieldConfig } from "../fields-interface";

@Component({
  selector: "app-radiobutton",
  template: `
    <mat-form-field
      [formGroup]="group"
      fxFlex
      [ngStyle]="{ width: 'calc(' + myWidth + ')' }"
    >
      <input matInput style="display: none !important; height: 0px;" />
      <label style="color: #767676">{{ field.label | i18next }} </label>
      <mat-radio-group [formControlName]="field.name">
        <mat-radio-button
          *ngFor="let item of field.options"
          [value]="item"
          color="primary"
        >
          {{ item }}
        </mat-radio-button>
      </mat-radio-group>

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
      .label {
        width: 30%;
        padding-right: 20px;
      }

      /*:host::ng-deep .mat-form-field-underline {
    display: none;
  }*/

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
export class RadiobuttonComponent implements OnInit {
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

  displayError(fieldId: string, currentError: string) {
    const controlErrors: ValidationErrors = this.group.get(fieldId).errors;
    let toDisplay = Object.keys(controlErrors)[0];
    return toDisplay == currentError;
  }
}
