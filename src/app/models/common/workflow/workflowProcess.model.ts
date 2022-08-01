import { BaseModel } from '@core/_base/crud/models/_base.model';

export class WorkflowProcessModel extends BaseModel {
	refNumber: number = null;
	processKey: string = '';
	stat: number = null;
	explanation: string = '';
	request: string = '';
	screenViewCurrentState: string = '';
	apiRoute: string = '';
	menuId: string = null;
	expireDate: string = '';
	insertUser: string = '';
	insertDateTime: string = '';
	updateUser: string = '';
	updateDateTime: string = '';
	actionBy: string = '';
	actionDateTime: string = '';
	apiMethod: string = '';
}
