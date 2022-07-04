import { BaseModel } from '@core/_base/crud/models/_base.model';
import { EntUserMenuApiModel } from './entMenuApi.model';

export class EntMenuTreeModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	parentMenuGuid: number = null;
	description: string = '';
	iconPath: string = '';
	routeUrl: string = '';
	screenOrder: number = null;
	authenticationLevel: number = null;
	userMenuApis: EntUserMenuApiModel[] = [];
}
