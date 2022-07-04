import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedInstalledModule } from 'app/shared-installed.module';
import { CoreModule } from '@core/core.module';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { SharedModule } from 'app/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatTreeModule } from '@angular/material';

import { ApiCallLogListComponent } from './apiCallLog/api-call-log-list/api-call-log-list.component';
import { ApiCallLogDetailComponent } from './apiCallLog/api-call-log-detail/api-call-log-detail.component';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

const routes: Routes = [
	{ path: 'apiCallLog', component: ApiCallLogListComponent },
	{ path: 'apiCallLogDetail', component: ApiCallLogDetailComponent },
	{ path: 'history', component: DynamicHistoryPageComponent },
];

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		PartialsModule,
		FormsModule,
		ReactiveFormsModule,
		SharedInstalledModule,
		CoreModule,
		ThemeModule,
		InlineSVGModule,
		SharedModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		MatTreeModule
	],

	declarations: [
		ApiCallLogListComponent,
		ApiCallLogDetailComponent
	],
	exports: [RouterModule],
	entryComponents: [
		ApiCallLogDetailComponent
	]
})
export class LogModule { }
