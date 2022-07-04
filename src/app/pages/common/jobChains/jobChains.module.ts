import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { CoreModule } from '@core/core.module';
import { JobChainDefinitionComponent } from './job-chain-definition/job-chain-definition.component';
import { JobChainTriggerDefComponent } from './job-chain-trigger-def/job-chain-trigger-def.component';
import { JobChainListComponent } from './job-chain-list/job-chain-list.component';
import { JobChainFlowDefComponent } from './job-chain-flow-def/job-chain-flow-def.component';
import { JobChainMonitoringComponent } from './job-chain-monitoring/job-chain-monitoring.component';
import { PartialsModule } from 'app/views/partials/partials.module';
import { JobExecutionHistoryComponent } from './job-execution-history/job-execution-history.component';
import { JobTriggerExecutorComponent } from './job-trigger-executor/job-trigger-executor.component';
import { JobProcessErrorPoolComponent } from './job-process-error-pool/job-process-error-pool.component';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CUSTOM_DATE_FORMATS } from 'app/app.component';
import { QuartzMinComponent } from './quartz-min/quartz-min.component';
import { CrystalQuartzComponent } from './crystal-quartz/crystal-quartz.component';


const routes: Routes = [
	{ path: 'jobChainDef', component: JobChainListComponent },
	{ path: 'jobChainDef/add', component: JobChainDefinitionComponent },
	{ path: 'jobChainDef/edit', component: JobChainDefinitionComponent },
	{ path: 'jobChainMonitoring', component: JobChainMonitoringComponent },
	{ path: 'jobExecutionHistory', component: JobExecutionHistoryComponent },
	{ path: 'jobProcessErrorPool', component: JobProcessErrorPoolComponent },
	{ path: 'quartzMin', component: QuartzMinComponent },
	{ path: 'crystalQuartz', component: CrystalQuartzComponent },
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
	],
	declarations: [JobChainDefinitionComponent,
		JobChainTriggerDefComponent,
		JobChainListComponent,
		JobChainFlowDefComponent,
		JobChainMonitoringComponent,
		JobExecutionHistoryComponent,
		JobTriggerExecutorComponent,
		JobProcessErrorPoolComponent,
		QuartzMinComponent,
		CrystalQuartzComponent],
	entryComponents: [
		JobChainTriggerDefComponent,
		JobChainFlowDefComponent,
		JobExecutionHistoryComponent,
		JobTriggerExecutorComponent,
		JobProcessErrorPoolComponent
	],
	providers: [
		{ provide: MAT_DATE_LOCALE, useValue: localStorage.getItem('language') },
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
		{ provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
	]
})
export class JobChainsModule { }
