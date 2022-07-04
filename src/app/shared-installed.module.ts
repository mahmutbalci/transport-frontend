import { NgModule } from '@angular/core';
import {
	MatButtonModule,
	MatMenuModule,
	MatSelectModule,
	MatInputModule,
	MatTableModule,
	MatAutocompleteModule,
	MatRadioModule,
	MatIconModule,
	MatNativeDateModule,
	MatProgressBarModule,
	MatDatepickerModule,
	MatCardModule,
	MatPaginatorModule,
	MatSortModule,
	MatCheckboxModule,
	MatProgressSpinnerModule,
	MatSnackBarModule,
	MatTabsModule,
	MatTooltipModule,
	MatDialogModule,
	MatFormFieldModule,
	MatListModule,
	MatStepperModule,
	MatSlideToggleModule,
	MatTreeModule,

} from '@angular/material';
import { NgbTooltipModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { QueryBuilderModule } from 'angular2-query-builder';
import { ChartsModule } from 'ng2-charts';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxCurrencyModule } from 'ngx-currency';

const _sharedInstalledModules = [
	MatButtonModule,
	MatMenuModule,
	MatSelectModule,
	MatInputModule,
	MatTableModule,
	MatAutocompleteModule,
	MatRadioModule,
	MatIconModule,
	MatNativeDateModule,
	MatProgressBarModule,
	MatDatepickerModule,
	MatCardModule,
	MatPaginatorModule,
	MatSortModule,
	MatCheckboxModule,
	MatProgressSpinnerModule,
	MatSnackBarModule,
	MatTabsModule,
	MatTooltipModule,
	MatDialogModule,
	NgbTooltipModule,
	MatFormFieldModule,
	MatListModule,
	NgSelectModule,
	TextMaskModule,
	DragDropModule,
	MatStepperModule,
	NgbModalModule,
	QueryBuilderModule,
	ChartsModule,
	NgbModule,
	MatSlideToggleModule,
	NgxMatSelectSearchModule,
	NgxCurrencyModule,
	MatTreeModule
];

@NgModule({
	imports: [
		..._sharedInstalledModules
	],
	exports: [
		..._sharedInstalledModules
	]
})
export class SharedInstalledModule {
}
