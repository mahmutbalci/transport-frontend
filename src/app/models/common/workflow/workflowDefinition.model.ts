import { BaseModel } from '@core/_base/crud/models/_base.model';
import { WorkflowStateModel } from './workflowState.model';

export class WorkflowDefinitionModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	institutionId: number = 0;
	apiRoute: string = '';
	apiMethod: string = '';
	expression: string = null;
	explanation: string = '';
	expireDayCount: number = null;
	insertUser: string = '';
	insertDateTime: string = '';
	updateUser: string = '';
	updateDateTime: string = '';
	expressionConfigGuid: number = null;
	workflowState: WorkflowStateModel[] = [];
}
