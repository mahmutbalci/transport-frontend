import { BaseModel } from '@core/_base/crud/models/_base.model';

export class CfgHolidayNationalModel extends BaseModel {
	guid: number = 0;
	institutionId: number = 1;
	holidayName: string = null;
	holidayDay: number = null;
	holidayMonth: number = null;
}
