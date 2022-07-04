import { BaseModel } from "@core/_base/crud/models/_base.model";

export class CfgTraceLogDetModel extends BaseModel {
	guid: number = 0;
	logGuid: number = 0;
	filed: string = "";
	OldValue: string = "";
	newValue: string = "";
	actionDate: Date = new Date();
}
