import { BaseModel } from '@core/_base/crud/models/_base.model';

export class AppUserDtoModel extends BaseModel {
	institutionId: number = null;
	clientId: string = '';
	name: string = '';
	midname: string = '';
	surname: string = '';
	email: string = '';
	mobileNumber: string = '';
	userStat: number = null;
	employeeId: string = '';
	isBuiltInUser: boolean = null;
	incorrectPasswordEntries: number = null;
	validPasswordRegex: string = '';
	userRoleIds: number[] = [];
}
