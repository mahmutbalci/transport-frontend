import { BaseModel } from "@core/_base/crud/models/_base.model";
 
export class BtcJobChainFlowModel extends BaseModel {
	guid: number = 0;
	chainGuid: number = null;
	triggerGuid: number=null;
	prevTriggerGuid:number=null;
	}
