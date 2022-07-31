import { BaseModel } from '@core/_base/crud/models/_base.model';

export class AppRoleMenuRelModel extends BaseModel {
	guid: number = 0;
	roleId: number = null;
	menuId: string = null;
	roleLevel: number = null;
}
