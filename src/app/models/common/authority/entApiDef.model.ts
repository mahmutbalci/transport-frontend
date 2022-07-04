import { BaseModel } from "@core/_base/crud/models/_base.model";
 
export class EntApiDefModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	parentApiGuid: number = null;
	apiRoute: string = "";
	description: string = "";
}
