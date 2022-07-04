import { BaseModel } from "@core/_base/crud/models/_base.model";

export class EntUserDtoModel extends BaseModel {
	lastUpdated: number = null;
	mbrId: number = null;
	id: string = "";
	userStat: number = null;
	authType: string = "";
	ticketType: string = "";
	employeeId: string = "";
	restrictionGuid: number = null;
	name: string = "";
	midname: string = "";
	surname: string = "";
	isBuiltInUser: boolean = null;
	branchGuid: number = null;
	email: string = "";
	mobileNumber: string = "";
	lastLoginDateTime: string = "";
	incorrectPasswordEntries: number = null;
	lastPasswordChangeDate: string = "";
	lastPasswordResetDate: string = "";
	enteredPassword: string = "";
	userRoleGuids: number[] = [];
}
