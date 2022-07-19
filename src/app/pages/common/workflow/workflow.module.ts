import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedInstalledModule } from '../../../shared-installed.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { CoreModule } from '@core/core.module';
import { MatTreeModule } from '@angular/material/tree';
import { WorkflowProcessListComponent } from '@common/workflow/workflowProcessList/workflow-process-list.component';
import { WorkflowDefinitionListComponent } from '@common/workflow/workflowDefinition/workflow-definition-list/workflow-definition-list.component';
import { WorkflowDefinitionComponent } from '@common/workflow/workflowDefinition/workflow-definition/workflow-definition.component';
import { WorkflowStateExpressionComponent } from '@common/workflow/workflowDefinition/workflow-state-expression-def/workflow-state-expression-def.component';
import { PartialsModule } from 'app/views/partials/partials.module';
import { ThemeModule } from 'app/views/themes/default/theme.module';
import { InlineSVGModule } from 'ng-inline-svg';

const routes: Routes = [
	{ path: 'workflowProcessList', component: WorkflowProcessListComponent, },
	{ path: 'workflowDefinition', component: WorkflowDefinitionListComponent },
	{ path: 'workflowDefinition/add', component: WorkflowDefinitionComponent },
	{ path: 'workflowDefinition/edit', component: WorkflowDefinitionComponent },
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
		MatTreeModule,
	],

	declarations: [
		WorkflowProcessListComponent,
		WorkflowDefinitionListComponent,
		WorkflowDefinitionComponent,
		WorkflowStateExpressionComponent,
	],
	exports: [RouterModule],
	entryComponents: [
		WorkflowStateExpressionComponent,
	]
})
export class WorkflowModule { }     
