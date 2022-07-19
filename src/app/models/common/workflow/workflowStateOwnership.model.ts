import { BaseModel } from '@core/_base/crud/models/_base.model';

export class WorkflowStateOwnershipModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	stateGuid: number = null;
	roleGuid: number = null;
	insertUser: string = '';
	insertDateTime: string = '';
	updateUser: string = '';
	updateDateTime: string = '';
}
