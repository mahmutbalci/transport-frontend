import { BaseModel } from '@core/_base/crud/models/_base.model';
import { WorkflowStateOwnershipModel } from './workflowStateOwnership.model';

export class WorkflowStateModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	workflowGuid: number = 0;
	state: number = null;
	expression: string = '';
	isFinalizeProcess: boolean = false;
	insertUser: string = '';
	insertDateTime: string = '';
	updateUser: string = '';
	updateDateTime: string = '';
	workflowStateOwnership: WorkflowStateOwnershipModel[] = [];
}
