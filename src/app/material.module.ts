/*
 * material.module is not a necessary file.
 * It was made in order to gather all angular-material imports together so that
 * app.module would be more readable. Other than that all imports can
 * be declared inside app.module.ts
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTreeModule } from "@angular/material/tree";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatNativeDateModule,
    MatTreeModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatOptionModule,
    MatCheckboxModule,
    MatRadioModule,
    MatGridListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatButtonToggleModule,
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatNativeDateModule,
    MatTreeModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatOptionModule,
    MatCheckboxModule,
    MatRadioModule,
    MatGridListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatButtonToggleModule,
  ],
})
export class MaterialModule {}
