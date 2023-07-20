import { Directive, Input, Injectable } from "@angular/core";
import {
  AbstractControl,
  NG_VALIDATORS,
  Validator,
  ValidatorFn,
  AsyncValidatorFn,
} from "@angular/forms";
import { RestService } from "../services/rest.service";
import { Observable, timer, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

// ---------------------------------------------------------- Length Validation ---------------------------------------------------------------
// A validator that checks if input is within char limit
export function LengthValidator(limit: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let myString = control.value;
    if (myString === null || myString === undefined) return null;
    return myString.length > limit
      ? { invalidLength: { valid: false, value: control.value } }
      : null;
  };
}

@Directive({
  selector: "[appLengthValidator]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: LengthValidatorDirective,
      multi: true,
    },
  ],
})
export class LengthValidatorDirective implements Validator {
  @Input("appLengthValidator") limit: number;
  validate(control: AbstractControl): { [key: string]: any } | null {
    return this.limit ? LengthValidator(this.limit)(control) : null;
  }
}

// -------------------------------------------------------- Regex Validation -------------------------------------------------------------------
// A validator that checks if input is valid based on given regExp
export function RegexValidator(regString: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const validExp = regString.test(control.value);
    return !validExp
      ? { invalidRegEx: { valid: false, value: control.value } }
      : null;
  };
}

@Directive({
  selector: "[appRegexValidator]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: RegexValidatorDirective,
      multi: true,
    },
  ],
  //multi for providing new directives without overriding existing ones
})
export class RegexValidatorDirective implements Validator {
  @Input("appRegexValidator") validExp: string;

  validate(control: AbstractControl): { [key: string]: any } | null {
    return this.validExp
      ? RegexValidator(new RegExp(this.validExp))(control)
      : null;
  }
}
//---------------------------------------------------- Check Unique Validation ------------------------------------------------------------------
//Example of Async Validator: checks if a given value already exists in db
//It requires an http request
@Injectable({
  providedIn: "root",
})
export class UniqueValidatorService {
  constructor(private rest: RestService) {}
  timeoutFunction;
  oldValue = null;

  checkUniqueCase(data: any, control: AbstractControl) {
    return timer(1000).pipe(
      switchMap(() => {
        // Check if entity doesn't already exist
        return this.rest.getRequestInfo(
          data.pathEntity,
          "uniqueIgnoreCase" +
            (data.pathId ? "/" + data.pathId : "") +
            "?" +
            data.elementName +
            "=" +
            control.value,
          null,
          null
        );
      })
    );
  }

  UniqueValidator(data: any): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      if (control.value === data.existingValue) {
        return of(null);
      } else {
        this.oldValue = control.value;
        return this.checkUniqueCase(data, control).pipe(
          map((res) => (res ? { unique: true } : null))
        );
      }
    };
  }
}
//----------------------------------Verify Password Validator --------------------------------------------

/*
 * Example of validator at form level (not field)
 * Lets Form to set errors if needed.
 * MatchValidatorField is just a dummy validator used in order to pass a validator message
 * when 'mismatch' error occurs.
 */
export function MatchFieldValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    return null;
  };
}

/*A validator that verifies if password and confimation password are a match.
 * TODO* Fix this => update MatchValidator to be a ganeric function that compares anything we like
 * Error msg appears only for verify password and the error is not updated until we change input value
 * needs a better validation handling
 */
export function MatchValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && control.parent.controls["password"].value) {
      let checkField: string = control.value;
      let checkFieldVerified: string =
        control.parent.controls["password"].value;

      if (control.valid && control.parent.controls["password"].valid) {
        if (checkField != checkFieldVerified) {
          control.setErrors({ mismatch: true });
          return { mismatch: { valid: false, value: control.value } };
        } else {
          control.setErrors(null);
        }
      }
    }
    return;
  };
}
