import { BaseModel } from '@core/_base/crud/models/_base.model';

export class CmpCampaignDefModel extends BaseModel {
	guid: number = 0;
	institutionId: number = 0;
	code: string = null; //5
	description: string = null;
	proiority: number = 0;
	isActive: boolean = true;
	beginDate: Date = new Date();
	endDate: Date = new Date();
	beginTime: string = '00:00:00';
	endTime: string = '00:00:00';
	passedNumber: number = 0;
	maxTxnAmount: number = 0;
	dailyTotalCount: number = 0;
	dailyTotalAmount: number = 0;
	budget: number = 0;
	discountRate: number = 0;
	weekday: string = null; //20

	cmpCampaignDets: CmpCampaignDetModel[] = [];
}


export class CmpCampaignDetModel extends BaseModel {
	guid: number = 0;
	campaignId: number = null; //16
	cardDigits: string = null; //10
	d042AcqId: string = null; //15
}
