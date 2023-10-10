import { BaseModel } from '@core/_base/crud/models/_base.model';

export class GetReportDailyRequestDto extends BaseModel {
	f13: string = null
	f39ResponseCode:string = null
	f42MerchantId: string = null
	F43Location : string = null
	cardMask: string = null
	card_encrypted: string = null
	TotalAmount: number = 0
	f06_org: string = null
	// TotalCount:number = 0
	// TotalCampaignAmount: number = 0
	// TotalCampaignCount: number = 0

	// public virtual string Indicator { get; set; }

	// public virtual string CardType { get; set; }
	// public virtual decimal F06 { get; set; }
	// public virtual decimal F06Org { get; set; }
	// public virtual decimal DiscountRate { get; set; }
	// public virtual long CampaignId { get; set; }
	
	
}