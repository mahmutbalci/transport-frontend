
import { BaseModel } from '@core/_base/crud/models/_base.model';

export class CfgTraceLogRequestModel extends BaseModel {
	actionDateStart: Date = new Date();
	actionDateEnd: Date = new Date();
	className: string = '';
	key: string = '';
	referenceId: string = '';
	userCode: string = '';
	channelCode: string = '';
	type: string = '';
	tableName: string = '';
	correlationDetail: boolean = false;
}
