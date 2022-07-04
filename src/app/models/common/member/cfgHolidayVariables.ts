import { BaseModel } from "@core/_base/crud/models/_base.model";

export class CfgHolidayVariablesModel extends BaseModel {
	guid: number = 0;
	mbrId: number = 1;
	holidayName: string = null;
	holidayDate: Date = null;
}
