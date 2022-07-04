import { BtcJobChainFiredTriggerModel } from "./btcJobChainFiredTrigger.model";

export interface BtcJobChainTriggerStatModel {
	guid: number;
	chainGuid: number;
	triggerGuid: number;
	parameters: string;
	stat: string;
	startDateTime: Date;
	endDateTime: Date;
	duration: number;
	firstTriggerTime: Date;
	firstTriggerGuid: number;
	triggeredBy: number;
	exception: string;
	firedTriggerDetail: BtcJobChainFiredTriggerModel;
}
