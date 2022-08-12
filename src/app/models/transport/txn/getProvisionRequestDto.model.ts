import { BaseModel } from '@core/_base/crud/models/_base.model';

export class GetProvisionRequestDto extends BaseModel {
	cardMask: string = null;
	ptcn: string = null;
	f37Rrn: string = null;
	f38AuthCode: string = null;
	f39ResponseCode: string = null;
	hasCampaign: number = null;
	txnDateBegin: Date = new Date();
	txnDateEnd: Date = new Date();
	fileInfoGuid: number = null;
	isFileSuccess: boolean = true;
}
