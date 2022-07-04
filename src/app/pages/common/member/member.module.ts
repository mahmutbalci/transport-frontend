import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PartialsModule } from 'app/views/partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { CfgTeamDefListComponent } from '@common/member/cfgTeamDef/cfg-team-def-list/cfg-team-def-list.component';
import { CfgTeamDefComponent } from '@common/member/cfgTeamDef/cfg-team-def/cfg-team-def.component';
import { CoreModule } from '@core/core.module';
import { CfgBranchDefComponent } from './cfgBranchDef/cfg-branch-def/cfg-branch-def.component';
import { CfgBranchDefListComponent } from './cfgBranchDef/cfg-branch-def-list/cfg-branch-def-list.component';
import { CfgHolidayListComponent } from './cfgHoliday/cfg-holiday-list/cfg-holiday-list.component';
import { CfgHolidayDefComponent } from './cfgHoliday/cfg-holiday-def/cfg-holiday-def.component';
import { CfgPointTypeDefComponent } from './cfgPointTypeDef/cfg-point-type-def/cfg-point-type-def.component';
import { CfgPointTypeDefListComponent } from './cfgPointTypeDef/cfg-point-type-def-list/cfg-point-type-def-list.component';
import { CfgMemoMonitoringListComponent } from './cfgMemoMonitoring/cfg-memo-list/cfg-memo-monitoring-list.component';
import { CfgMemoMonitoringComponent } from './cfgMemoMonitoring/cfg-memo-monitoring/cfg-memo-monitoring.component';
import { CfgMemoDefinitionComponent } from './cfgMemoDef/cfg-memo-def/cfg-memo-def.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { CfgMemberDefListComponent } from './cfgMemberDef/cfg-member-def-list/cfg-member-def-list.component';
import { CfgMemberDefComponent } from './cfgMemberDef/cfg-member-def/cfg-member-def.component';
import { CfgDashboardComponent } from './cfgDashboard/cfg-dashboard/cfg-dashboard.component';
import { CfgDashboardListComponent } from './cfgDashboard/cfg-dashboard-list/cfg-dashboard-list.component';
import { AngularEditorModule } from '@kolkov/angular-editor';

const routes: Routes = [
	{ path: 'cfgMemoMonitoring', component: CfgMemoMonitoringListComponent },
	{ path: 'cfgMemoMonitoring/add', component: CfgMemoMonitoringComponent },
	{ path: 'cfgTeamDef', component: CfgTeamDefListComponent },
	{ path: 'cfgTeamDef/add', component: CfgTeamDefComponent },
	{ path: 'cfgTeamDef/edit', component: CfgTeamDefComponent },
	{ path: 'cfgBranchDef', component: CfgBranchDefListComponent },
	{ path: 'cfgBranchDef/add', component: CfgBranchDefComponent },
	{ path: 'cfgBranchDef/edit', component: CfgBranchDefComponent },
	{ path: 'cfgHolidayDef', component: CfgHolidayListComponent },
	{ path: 'cfgHolidayDef/add', component: CfgHolidayDefComponent },
	{ path: 'cfgHolidayDef/edit', component: CfgHolidayDefComponent },
	{ path: 'cfgMemoDef', component: CfgMemoDefinitionComponent },
	{ path: 'cfgPointTypeDef', component: CfgPointTypeDefListComponent },
	{ path: 'cfgPointTypeDef/add', component: CfgPointTypeDefComponent },
	{ path: 'cfgPointTypeDef/edit', component: CfgPointTypeDefComponent },
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
		CfgMemoMonitoringComponent,
		CfgMemoMonitoringListComponent,
		CfgTeamDefComponent,
		CfgTeamDefListComponent,
		CfgBranchDefComponent,
		CfgBranchDefListComponent,
		CfgHolidayListComponent,
		CfgHolidayDefComponent,
		CfgMemoDefinitionComponent,
		CfgPointTypeDefComponent,
		CfgPointTypeDefListComponent,
		CfgMemberDefListComponent,
		CfgMemberDefComponent,
		CfgDashboardComponent,
		CfgDashboardListComponent,
	],
	exports: [RouterModule],

})
export class MemberModule { }
