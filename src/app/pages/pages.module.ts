import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from '@pages/pages-routing.module';
import { PagesComponent } from '@pages/pages.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// Core 
import {
	MAT_DIALOG_DEFAULT_OPTIONS,
	MAT_DIALOG_DATA,
	MatDialogRef,
	MAT_DATE_LOCALE
} from '@angular/material';
import { CoreModule } from '@core/core.module';
import { SharedInstalledModule } from '../shared-installed.module';
import { SharedModule } from '../shared.module';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
	declarations: [
		PagesComponent,
	],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		NgbModule,
		CoreModule,
		PartialsModule,
		ReactiveFormsModule,
		PagesRoutingModule,
		LayoutModule,
		AngularEditorModule,
		SharedInstalledModule,
		SharedModule,
		ThemeModule,
	],
	providers: [
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'm-mat-dialog-container__wrapper',
				height: 'auto',
				width: '1200px'
			}

		},
		{ provide: MAT_DIALOG_DATA, useValue: [] },
		{ provide: MatDialogRef, useValue: {} },
		{ provide: MAT_DATE_LOCALE, useValue: sessionStorage.getItem('language') },

	]
})
export class PagesModule { }
