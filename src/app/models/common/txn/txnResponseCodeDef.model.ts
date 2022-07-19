import { BaseModel } from '@core/_base/crud/models/_base.model';

export class TxnResponseCodeDefModel extends BaseModel {
	lastUpdated: number = 1;
	code: string = '';
	description: string = '';
	isApproved: boolean = false;
}
