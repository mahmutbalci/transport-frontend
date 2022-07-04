import { BaseModel } from "@core/_base/crud/models/_base.model";
 
export class EntUserMenuApiModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 0;
	menuGuid: number = 0;
	apiGuid: number = 0;

	public constructor(init?:Partial<EntUserMenuApiModel>) {
		super();
		Object.assign(this, init);
    }
}
