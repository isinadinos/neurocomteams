import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { I18NextModule } from "angular-i18next";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MenuComponent } from "./app-contents/menu/menu.component";
import { MaterialModule } from "./material.module";
import { Page1Component } from "./app-contents/menu/page1/page1.component";
import { InputComponent } from "./app-contents/dynamic-form/components/input.component";
import { DateComponent } from "./app-contents/dynamic-form/components/date.component";
import { SelectComponent } from "./app-contents/dynamic-form/components/select.component";
import { RadiobuttonComponent } from "./app-contents/dynamic-form/components/radiobutton.component";
import { CheckboxComponent } from "./app-contents/dynamic-form/components/checkbox.component";
import { DynamicFieldDirective } from "./app-contents/dynamic-form/components/dynamic-form/dynamic-field.directive";
import { DynamicFormComponent } from "./app-contents/dynamic-form/components/dynamic-form/dynamic-form.component";
import { ButtonComponent } from "./app-contents/dynamic-form/components/button.component";
import { I18N_PROVIDERS } from "./internationalization";
import { AutocompleteComponent } from "./app-contents/dynamic-form/components/autocomplete.component";
import { Page2Component } from "./app-contents/menu/page2/page2.component";
import { ColFilterPipe } from "./app-contents/pipes-validators/col-filter.pipe";
import {
  DecimalPipe,
  DatePipe,
  LowerCasePipe,
  UpperCasePipe,
  CurrencyPipe,
  PercentPipe,
} from "@angular/common";
import { CustomMatPagination } from "./app-contents/table-info/custom-mat-pagination";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { PaginationComponent } from "./app-contents/table-info/pagination";
import { CsrfInterceptor } from "./app-contents/guards-interceptors/csrf-interceptor";
import { registerLocaleData } from "@angular/common";
import localeEl from "@angular/common/locales/el";
import { NotFoundComponent } from "./app-contents/menu/not-found/not-found.component";
import { InterceptorService } from "./app-contents/services/interceptor.service";
import { SafePipe } from "./app-contents/pipes-validators/safe.pipe";
import { TeamsModule } from "./teams.module";
import { GroupsComponent } from './app-contents/menu/groups/groups.component';
import { ProfileComponent } from './app-contents/menu/profile/profile.component';

// the second parameter 'el' is optional
registerLocaleData(localeEl, "el");
/*
 * This defines date format based on region -> greek here
 */
export const MY_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "L",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    Page1Component,
    InputComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFieldDirective,
    DynamicFormComponent,
    ButtonComponent,
    AutocompleteComponent,
    Page2Component,
    ColFilterPipe,
    PaginationComponent,
    NotFoundComponent,
    SafePipe,
    GroupsComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TeamsModule,
    MaterialModule,
    I18NextModule.forRoot(),
    AppRoutingModule,
  ],
  //Providers Theory:
  //https://angular.io/guide/dependency-injection-providers
  providers: [
    I18N_PROVIDERS,
    { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: MatPaginatorIntl, useClass: CustomMatPagination },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    UpperCasePipe,
    CurrencyPipe,
    PercentPipe,
  ],
  //EntryComponents Theory:
  //https://angular.io/guide/entry-components
  entryComponents: [
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    AutocompleteComponent,
  ], //declaration of dynamic components
  bootstrap: [AppComponent],
})
export class AppModule {}
