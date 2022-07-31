import { BaseModel } from '@core/_base/crud/models/_base.model';

export class AppRoleApiRelModel extends BaseModel {
	guid: number = 0;
	roleId: number = null;
	apiId: number = null;
	roleLevel: number = null;
}
