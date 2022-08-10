import { BaseModel } from '@core/_base/crud/models/_base.model';

export class CmpCampaignDefModel extends BaseModel {
	guid: number = 0;
	institutionId: number = 0;
	code: string = null; //5
	description: string = null;
	proiority: number = null;
	isActive: boolean = true;
	beginDate: Date = null;
	endDate: Date = null;
	beginTime: string = null;
	endTime: string = null;
	passedNumber: number = null;
	maxTxnAmount: number = null;
	dailyTotalCount: number = null;
	dailyTotalAmount: number = null;
	budget: number = null;
	discountRate: number = null;
	weekday: string = null; //20

	cmpCampaignDets: CmpCampaignDetModel[] = [];
}


export class CmpCampaignDetModel extends BaseModel {
	guid: number = 0;
	campaignId: number = null; //16
	cardDigits: string = null; //10
	d042AcqId: string = null; //15
}
