import { BaseModel } from '@core/_base/crud/models/_base.model';

export class CfgPinEntryDefModel extends BaseModel {
	lastUpdated: number = 1;
	code: number = null;
	description: string = null;
}
