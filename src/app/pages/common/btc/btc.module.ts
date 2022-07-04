import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { CoreModule } from '@core/core.module';
import { CoreComponentsModule } from '@core/core.components.module';
import { MatTreeModule } from '@angular/material/tree';
import { MessagePoolMonitoringComponent } from '@common/btc/messagePool/message-pool-monitoring/message-pool-monitoring.component';
import { MessagePoolDetailComponent } from '@common/btc/messagePool/message-pool-detail/message-pool-detail.component';
import { PartialsModule } from 'app/views/partials/partials.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MsnMessageTemplateDefListComponent } from './MsnMessageTemplateDef/msn-message-template-def-list/msn-message-template-def-list.component';
import { MsnMessageTemplateDefComponent } from './MsnMessageTemplateDef/msn-message-template-def/msn-message-template-def.component';

const routes: Routes = [
	{ path: 'msnMessagePoolMonitoring', component: MessagePoolMonitoringComponent },
	{ path: 'msnMessagePoolDetail', component: MessagePoolDetailComponent },
	{ path: 'msnMessageTemplateDef', component: MsnMessageTemplateDefListComponent },
	{ path: 'msnMessageTemplateDef/add', component: MsnMessageTemplateDefComponent },
	{ path: 'msnMessageTemplateDef/edit', component: MsnMessageTemplateDefComponent },
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
		CoreComponentsModule,
		SharedModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		MatTreeModule,
		InlineSVGModule,
		AngularEditorModule
	],

	declarations: [
		MessagePoolMonitoringComponent,
		MessagePoolDetailComponent,
		MsnMessageTemplateDefListComponent,
		MsnMessageTemplateDefComponent
	],
	exports: [RouterModule],
	entryComponents: [
	]
})
export class BtcModule { }
