import { BaseModel } from '@core/_base/crud/models/_base.model';
import { EntUserRoleMenuModel } from './entUserRoleMenu.model';
import { EntUserRoleApiModel } from './entUserRoleApi.model';

export class EntUserRoleDefModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	institutionId: number = 0;
	ticketType: string = 'M';
	description: string = '';
	userRoleMenus: EntUserRoleMenuModel[] = [];
	userRoleApis: EntUserRoleApiModel[] = [];
}
