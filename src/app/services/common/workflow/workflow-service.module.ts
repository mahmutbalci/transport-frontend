import { NgModule } from '@angular/core';
import { WorkflowProcessService } from './workflowProcess.service';
import { WorkflowDefinitionService } from './workflowDefinition.service';


@NgModule({
	providers: [
		WorkflowProcessService,
		WorkflowDefinitionService,
	],
})
export class WorkflowServiceModule { }
