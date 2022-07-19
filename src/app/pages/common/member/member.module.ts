import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { CoreModule } from '@core/core.module';
import { CfgHolidayListComponent } from './cfgHoliday/cfg-holiday-list/cfg-holiday-list.component';
import { CfgHolidayDefComponent } from './cfgHoliday/cfg-holiday-def/cfg-holiday-def.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { CfgDashboardComponent } from './cfgDashboard/cfg-dashboard/cfg-dashboard.component';
import { CfgDashboardListComponent } from './cfgDashboard/cfg-dashboard-list/cfg-dashboard-list.component';
import { AngularEditorModule } from '@kolkov/angular-editor';

const routes: Routes = [
	{ path: 'cfgHolidayDef', component: CfgHolidayListComponent },
	{ path: 'cfgHolidayDef/add', component: CfgHolidayDefComponent },
	{ path: 'cfgHolidayDef/edit', component: CfgHolidayDefComponent },
	{ path: 'cfgDashboard', component: CfgDashboardListComponent },
	{ path: 'cfgDashboard/add', component: CfgDashboardComponent },
	{ path: 'cfgDashboard/edit', component: CfgDashboardComponent },
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
		SharedModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		InlineSVGModule,
		AngularEditorModule,
	],
	declarations: [
		CfgHolidayListComponent,
		CfgHolidayDefComponent,
		CfgDashboardComponent,
		CfgDashboardListComponent,
	],
	exports: [RouterModule],

})
export class MemberModule { }
