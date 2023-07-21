import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../fields-interface";

@Component({
  selector: "app-button",
  template: `
    <span [hidden]="field?.hidden">
      <button
        type="submit"
        name="{{ field.name }}"
        mat-raised-button
        class="button-group activeButton"
      >
        {{ field.label | i18next }}
      </button>
    </span>
  `,
  styles: [
    `
      .button-group {
        padding-bottom: 5px;
        padding-top: 5px;
        margin: 10px;
      }
    `,
  ],
})
export class ButtonComponent implements OnInit {
  field: FieldConfig;
  group: FormGroup;

  constructor() {}

  ngOnInit() {}
}
