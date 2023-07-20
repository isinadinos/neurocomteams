/*
 * A component that represents a form.
 */

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { FieldConfig } from "../../fields-interface";
import { MatchValidator } from "src/app/app-contents/pipes-validators/common-validators.directive";

@Component({
  selector: "dynamic-form",
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit($event)">
      <fieldset class="well">
        <mat-card>
          <mat-toolbar>{{ formLabel | i18next }}</mat-toolbar>
          <br />
          <div
            *ngFor="
              let index of fields | slice: 0:fields.length - countButtons;
              let i = index
            "
            fxLayout="row"
            fxLayout.lt-md="column"
          >
            <div
              *ngIf="i % rowSize == 0"
              [ngStyle]="{ 'text-align': rowSize == 1 ? 'center' : 'none' }"
            >
              <span *ngFor="let item of [].constructor(rowSize); let j = index">
                <span
                  *ngIf="
                    i + j < fields.length && fields[i + j]?.type != 'button'
                  "
                  dynamicField
                  [field]="fields[i + j]"
                  [group]="form"
                  [rowSize]="rowSize"
                ></span>
              </span>
            </div>
          </div>

          <div style="text-align: center;">
            <ng-container
              *ngFor="
                let field of fields
                  | slice: fields.length - countButtons:fields.length
              "
              dynamicField
              [field]="field"
              [group]="form"
            >
            </ng-container>
          </div>
        </mat-card>
      </fieldset>
    </form>
  `,
  styles: [
    `
      .mat-card {
        box-shadow: none !important;
      }
    `,
  ],
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  @Input() fields: FieldConfig[] = []; //list of form fields
  @Input() formLabel: string; // label of form card
  @Input() rowSize: number; // number of fields in each row
  @Input() globalValidator?: boolean; //globalValidator is true when we want to use MatchValidator in order to check if verification of password matches password input

  //EventEmitter will notify parent component when  the form is submitted
  @Output() formEvent: EventEmitter<any> = new EventEmitter<any>();
  oldFields: FieldConfig[];
  form: FormGroup;
  countButtons: number;

  constructor(private fb: FormBuilder) {
    this.countButtons = 0;
  }

  ngOnInit() {
    this.form = this.createControl();
  }

  ngOnDestroy() {
    this.formEvent.complete();
  }

  //creates validation controls for each field of the form
  createControl() {
    const group = this.globalValidator
      ? this.fb.group({}, { validator: MatchValidator })
      : this.fb.group({});

    this.fields.forEach((field) => {
      if (field.type === "button") {
        this.countButtons++;
        return;
      }
      const control = this.fb.control(
        { value: field.value, disabled: field.disabled },
        //field.value,
        this.bindValidations(field.validations || []),
        this.bindAsyncValidations(field.asyncValidations || [])
      );
      group.addControl(field.name, control);
    });

    return group;
  }

  bindAsyncValidations(asyncValidations: any) {
    if (asyncValidations.length > 0) {
      const validList = [];
      asyncValidations.forEach((valid) => {
        validList.push(valid.asyncValidator);
      });
      return Validators.composeAsync(validList);
    }
    return null;
  }

  bindValidations(validations: any) {
    if (validations.length > 0) {
      const validList = [];
      validations.forEach((valid) => {
        validList.push(valid.validator);
      });
      //compose Validators into a single function
      return Validators.compose(validList);
    }
    return null;
  }

  //return value of form to parent
  get value() {
    return this.form.value;
  }

  onSubmit(event: Event) {
    var buttonName = document.activeElement.getAttribute("Name");
    event.preventDefault();
    event.stopPropagation();
    delete this.form.value["undefined"]; //might need new condition for search
    if ((buttonName != "submit" && buttonName != "search") || this.form.valid) {
      this.formEvent.emit([this.form.value, buttonName, this.form]);
    } else {
      Object.keys(this.form.controls).forEach((field) => {
        const control = this.form.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  setFields(obj) {
    this.fields = obj;
  }
}
