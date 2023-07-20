import { Component, OnInit, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../fields-interface";

@Component({
  selector: "app-checkbox",
  template: `
    <mat-form-field
      [formGroup]="group"
      fxFlex
      [ngStyle]="{ width: 'calc(' + myWidth + ')' }"
    >
      <input matInput style="display: none !important; height: 0px;" />
      <label style="color: #767676"
        >{{ field.label | i18next }}
        <mat-checkbox
          [formControlName]="field.name"
          style="color: #767676"
          color="primary"
        ></mat-checkbox>
      </label>
    </mat-form-field>
  `,

  styles: [
    `
      /*:host::ng-deep .mat-form-field-infix{
      border-top: 0 !important;
    }

    :host::ng-deep .mat-form-field-underline {
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
export class CheckboxComponent implements OnInit {
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
}
