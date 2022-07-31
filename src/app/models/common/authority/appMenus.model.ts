import { BaseModel } from '@core/_base/crud/models/_base.model';
import { AppMenuApiRelModel } from './appMenuApiRel.model';

export class AppMenusModel extends BaseModel {
	menuId: string = '';
	parentMenuId: string = null;
	description: string = '';
	iconPath: string = '';
	routeUrl: string = '';
	screenOrder: number = null;
	menuApiRels: AppMenuApiRelModel[] = [];
}
