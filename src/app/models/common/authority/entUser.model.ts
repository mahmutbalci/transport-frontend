import { BaseModel } from "@core/_base/crud/models/_base.model";
import { EntUserRoleOwnershipModel } from "./entUserRoleOwnership.model";
 
export class EntUserModel extends BaseModel {
	lastUpdated: number = 1;
	key: UserKey = new UserKey();
	userStat: number = null;
	authType: string = "L";
	ticketType: string = "M";
	employeeId: string = "";
	restrictionGuid: number = null;
	name: string = "";
	midname: string = "";
	surname: string = "";
	isBuiltInUser: boolean = false;
	email: string = "";
	lastLoginDateTime: string = "";
	incorrectPasswordEntries: number = 0;
	lastPasswordChangeDate: string = "";
	lastPasswordResetDate: string = "";
	userRoleOwnerShips: EntUserRoleOwnershipModel[] = [];
	enteredPassword: string = "";
}

export class UserKey extends BaseModel {
	id: string = "";
	mbrId: number = 1;
}
