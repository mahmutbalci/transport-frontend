import { BaseModel } from '@core/_base/crud/models/_base.model';

export class GetReportMonthlyRequestDto extends BaseModel {
	month: string = null
	f39ResponseCode:string = null
	f43Location : string = null
	indicator: string = null
	bin: string = null
	F06: string = null
	successCount: number = 0;
	failCount: number = 0;
	totalCount: number = 0
	successTotalAmount: number = 0
	failTotalAmount:number=0	
	totalAmount:number=0
	

}