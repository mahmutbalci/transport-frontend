import { BaseModel } from '@core/_base/crud/models/_base.model';

export class AppUserRoleRelModel extends BaseModel {
	guid: number = 0;
	roleId: string = null;
	clientId: string = null;
	institutionId: number = 0;

	clear() {
		this.guid = 0;
		this.roleId = '';
		this.clientId = '';
		this.institutionId = 0;
	}
}
