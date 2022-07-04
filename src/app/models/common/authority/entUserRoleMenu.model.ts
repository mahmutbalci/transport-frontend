import { BaseModel } from "@core/_base/crud/models/_base.model";

export class EntUserRoleMenuModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	roleGuid: number = null;
	menuGuid: number = null;
	authenticationLevel: number = null;
}
