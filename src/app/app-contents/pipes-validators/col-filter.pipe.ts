/*
 * A 'master' pipe that receives the type of data transformation that needs to be done
 * along with respective argument parameters and returns the transformed data.
 * ColFilterPipe is used for trasforming columns in a more generic way (table data)
 */

import { Pipe, PipeTransform } from "@angular/core";
import {
  DatePipe,
  DecimalPipe,
  CurrencyPipe,
  LowerCasePipe,
  UpperCasePipe,
  PercentPipe,
} from "@angular/common";
import parse from "date-fns/parse";

@Pipe({
  name: "colFilter",
})
export class ColFilterPipe implements PipeTransform {
  constructor(
    private decimal: DecimalPipe,
    private date: DatePipe,
    private currency: CurrencyPipe,
    private lowerCase: LowerCasePipe,
    private upperCase: UpperCasePipe,
    private percent: PercentPipe
  ) {}

  transform(value: any, params: string): any {
    let newValue: any;
    let customArgs = params.split("//");
    let type = customArgs[0];
    let argument = customArgs[1];
    let argument2 = customArgs[2];
    let argument3 = customArgs[3];
    let argument4 = customArgs[3];
    //console.log("type: ", type, " arguments ", argument)

    switch (type) {
      case "decimal": //argument = number of digits argumet2 = locale
        newValue = this.decimal.transform(value, argument, argument2);
        break;
      case "date": //argument = format of date
        newValue = this.date.transform(value, argument);
        break;
      case "toDate": // argument = format of value (eg. YYYYMMDD), argument2 = format of output date
        let dateValue = parse(value, argument, new Date());
        if (argument2) {
          newValue = this.date.transform(dateValue, argument2); //this.date.transform(dateValue, argument2);
        } else {
          newValue = this.date.transform(dateValue);
        }
        break;
      case "upperCase":
        newValue = this.upperCase.transform(value);
        break;
      case "lowerCase":
        newValue = this.lowerCase.transform(value);
        break;
      case "currency": //argument = currencyCode argument2 = format argument3 = number of digits
        newValue = this.currency.transform(
          value,
          argument,
          argument2,
          argument3
        );
        break;
      case "percent":
        newValue = this.percent.transform(value, argument);
        break;
      case "fileSize":
        if (value < 1024) {
          newValue = Number(value) + " Bytes";
        } else if (value < 1024 * 1024) {
          newValue = Number(value.toFixed(2) / 1024).toFixed(2) + " KB";
        } else if (value < 1024 * 1024 * 1024) {
          newValue =
            Number(value.toFixed(2) / (1024 * 1024)).toFixed(2) + " MB";
        } else {
          newValue =
            Number(value.toFixed(2) / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        }
        break;
      default:
        newValue = value;
    }

    //console.log("pipe: ", type," old value: ", value, " new value: ", newValue, " ", typeof newValue);

    return newValue;
  }
}
