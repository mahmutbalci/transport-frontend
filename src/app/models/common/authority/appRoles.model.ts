import { BaseModel } from '@core/_base/crud/models/_base.model';
import { AppRoleApiRelModel } from './appRoleApiRel.model';
import { AppRoleMenuRelModel } from './appRoleMenuRel.model';

export class AppRolesModel extends BaseModel {
	roleId: number = 0;
	institutionId: number = 0;
	roleType: string = null;
	description: string = '';
	roleMenuRels: AppRoleMenuRelModel[] = [];
	roleApiRels: AppRoleApiRelModel[] = [];
}
