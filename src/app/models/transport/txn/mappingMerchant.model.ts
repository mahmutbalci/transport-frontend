import { BaseModel } from '@core/_base/crud/models/_base.model';

export class MappingMerchantModel extends BaseModel {
	guid: number; //16
	institutionId: number = 0;
	bankCode: string = null; //5
	d042SourceAcqId: string = null;
	d042DestAcqId: string = null;
	d042AcqId: string = null;
	terminalId: string = "0";
	merchantName: string = null
	
	// mappingMerchantDets: MappingMerchantModelDetModel[] = [];
}

// export class MappingMerchantModelDetModel extends BaseModel {
// 	guid: number = 0;
// 	institutionId: number = null; 
// 	cardDigits: string = null; 
// 	d042AcqId: string = null; 
	
// }

