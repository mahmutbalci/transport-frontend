import { BaseModel } from '@core/_base/crud/models/_base.model';

export class AppMenuApiRelModel extends BaseModel {
	guid: number = 0;
	menuId: string = null;
	apiId: number = 0;

	public constructor(init?: Partial<AppMenuApiRelModel>) {
		super();
		Object.assign(this, init);
	}
}
