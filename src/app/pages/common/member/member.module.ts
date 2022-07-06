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
import { InlineSVGModule } from 'ng-inline-svg';
import { CfgMemberDefListComponent } from './cfgMemberDef/cfg-member-def-list/cfg-member-def-list.component';
import { CfgMemberDefComponent } from './cfgMemberDef/cfg-member-def/cfg-member-def.component';
import { CfgDashboardComponent } from './cfgDashboard/cfg-dashboard/cfg-dashboard.component';
import { CfgDashboardListComponent } from './cfgDashboard/cfg-dashboard-list/cfg-dashboard-list.component';
import { AngularEditorModule } from '@kolkov/angular-editor';

const routes: Routes = [
	{ path: 'cfgMemberDef', component: CfgMemberDefListComponent },
	{ path: 'cfgMemberDef/add', component: CfgMemberDefComponent },
	{ path: 'cfgMemberDef/edit', component: CfgMemberDefComponent },
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
		CfgMemberDefListComponent,
		CfgMemberDefComponent,
		CfgDashboardComponent,
		CfgDashboardListComponent,
	],
	exports: [RouterModule],

})
export class MemberModule { }
