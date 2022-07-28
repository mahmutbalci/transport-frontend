import { BaseModel } from '@core/_base/crud/models/_base.model';

export class EntUserRoleOwnershipModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	roleGuid: string = '';
	userCode: string = '';
	institutionId: number = 1;

	clear() {
		this.guid = 0;
		this.lastUpdated = 1;
		this.roleGuid = '';
		this.userCode = '';
		this.institutionId = 1;
	}
}
