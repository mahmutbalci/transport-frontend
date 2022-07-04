import { BaseModel } from "@core/_base/crud/models/_base.model";
 
export class EntUserRoleApiModel extends BaseModel {
	guid: number=0;
	lastUpdated: number = 1;
	roleGuid: number = null;
	apiGuid: number = null;
	authenticationLevel: number = null;
}
