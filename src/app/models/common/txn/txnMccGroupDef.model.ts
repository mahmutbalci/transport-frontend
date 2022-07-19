import { BaseModel } from '@core/_base/crud/models/_base.model';

export class TxnMccGroupDefModel extends BaseModel {
	lastUpdated: number = 1;
	code: string = '';
	description: string = '';
	qualifierCode: string = '';
	isContactless: boolean = false;
}
