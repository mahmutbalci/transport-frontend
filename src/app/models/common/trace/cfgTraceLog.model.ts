import { BaseModel } from '@core/_base/crud/models/_base.model';
import { CfgTraceLogDetModel } from './cfgTraceLogDet.model';

export class CfgTraceLogModel extends BaseModel {
	guid: number = 0;
	institutionId: number;
	tableName: string = '';
	className: string = '';
	keyColumn: string = '';
	keyName: string = '';
	key: string = '';
	type: string = '';
	userCode: string = '';
	channel: string = '';
	referenceId: string = '';
	actionDate: Date = new Date();
	actionTime: Date = new Date();

	cfgTraceLogDet: CfgTraceLogDetModel[] = [];
}
