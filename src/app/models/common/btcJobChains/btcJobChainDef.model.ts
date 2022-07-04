import { BtcJobChainTriggerModel } from "./btcJobChainTrigger.model";
import { BtcJobChainFlowModel } from "./btcJobChainFlow.model";
import { BaseModel } from "@core/_base/crud/models/_base.model";

export class BtcJobChainDefModel extends BaseModel{
	guid: number = 0;
	mbrId: number = 0;
	description: string = null;
	triggers: BtcJobChainTriggerModel[] = [];
	flows: BtcJobChainFlowModel[] = [];
}
