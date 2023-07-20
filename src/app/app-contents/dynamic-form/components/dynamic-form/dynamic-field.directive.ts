import {
  Directive,
  Input,
  OnInit,
  ComponentFactoryResolver,
  ViewContainerRef,
  OnDestroy,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../../fields-interface";
import { InputComponent } from "../input.component";
import { ButtonComponent } from "../button.component";
import { SelectComponent } from "../select.component";
import { DateComponent } from "../date.component";
import { RadiobuttonComponent } from "../radiobutton.component";
import { CheckboxComponent } from "../checkbox.component";
import { AutocompleteComponent } from "../autocomplete.component";

//componentMapper will map the field types with each component
const componentMapper = {
  input: InputComponent,
  button: ButtonComponent,
  select: SelectComponent,
  date: DateComponent,
  radiobutton: RadiobuttonComponent,
  checkbox: CheckboxComponent,
  autocomplete: AutocompleteComponent,
};

/*
Note: Different types of selectors
name selectors and attribute selectors
https://blog.knoldus.com/different-types-of-component-selectors-in-angular/
*/

@Directive({
  selector: "[dynamicField]",
})
export class DynamicFieldDirective implements OnInit, OnDestroy {
  // Directive receives input field coinfiguration and formgroup from parent component
  // and binds the values to the corresponding field component
  @Input() field: FieldConfig;
  @Input() group: FormGroup;
  @Input() rowSize: number;

  //Represents a component created by a ComponentFactory.
  // Provides access to the component instance and related objects, and provides the means of destroying the instance.
  ref: any;
  componentRef: any;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) {}

  ngOnInit() {
    //creates factory to resolve each dynamic component
    const factory = this.resolver.resolveComponentFactory(
      componentMapper[this.field.type]
    );
    //creates view container for component to allow access
    this.componentRef = this.container.createComponent(factory);
    this.ref = this.componentRef;
    //passes input variables to component
    this.componentRef.instance.field = this.field;
    this.componentRef.instance.group = this.group;
    this.componentRef.instance.rowSize = this.rowSize;
  }

  ngOnDestroy() {}
}
