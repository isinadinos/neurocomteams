/*Idea: Create components for each type of field (input, checkbox, date etc) and
 * compile them inside a form during runtime
 * Each component accepts a FormGroup and a FieldConfig Object containing necessary information about
 * a specific form field (some attributes may be optional)
 */
export interface Validator {
  name: string; //errorcode produced by validators
  validator: any; // validator function
  message: string; // error message to display
}

export interface FieldConfig {
  label?: string; // Value of field label
  name?: string; // field id
  inputType?: string; //type of input field when dynacim component is input (eg. type="text" or type="password")
  disabled?: boolean; // field dasabled or not
  options?: any; // options for dropdown list (select, autocomplete)
  url?: string; // url string for making an http request to server - used by autocomplete in order to get options while typing
  type: string; //type of dynamic component
  value?: any; // initial value of field
  hidden?: boolean; // field hidden or not
  validations?: Validator[]; // list of validators for each field
  asyncValidations?: any; //AsyncValidatorFn[]; list of async validators
}
