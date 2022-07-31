import { BaseModel } from '@core/_base/crud/models/_base.model';
import { AppUserRoleRelModel } from './appUserRoleRel.model';

export class AppUsersModel extends BaseModel {
	key: UserKey = new UserKey();
	userStat: number = null;
	employeeId: string = '';
	name: string = '';
	midname: string = '';
	surname: string = '';
	email: string = '';
	channelCode: string = null;
	isBuiltInUser: boolean = false;
	sessionDuration: number = 60;
	validPasswordRegex: string = '[^a-zA-Z0-9]';
	blockWrongPasswordCount: number = null;
	incorrectPasswordEntries: number = 0;
	enteredPassword: string = '';
	appUserRoleRels: AppUserRoleRelModel[] = [];
}

export class UserKey extends BaseModel {
	clientId: string = '';
	institutionId: number = 0;
}
