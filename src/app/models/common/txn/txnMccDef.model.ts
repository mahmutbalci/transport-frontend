import { BaseModel } from '@core/_base/crud/models/_base.model';

export class TxnMccDefModel extends BaseModel {
	lastUpdated: number = 1;
	code: string = '';
	description: string = '';
	terminalCategoryCode: string = '';
	mccGroupCode: string = '';
	isVisa: boolean = false;
	isMastercard: boolean = false;
	isTax: boolean = false;
	taxRatio: number = 0;;
}
