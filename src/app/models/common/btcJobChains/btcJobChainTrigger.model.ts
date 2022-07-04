import { BaseModel } from "@core/_base/crud/models/_base.model";

export class BtcJobChainTriggerModel extends BaseModel {

	constructor() {
		super();
		this.setDefaultParameters();
	}

	setDefaultParameters() {
		this.parameters = `{"CommitItemCount" : "50", 
						   "PerThreadItemCount" : "500",
						   "ThreadCount" : "8"}`;
	}

	guid: number = 0;
	chainGuid: number = null;
	parentTriggerGuid: number = null;
	type: string = null;
	className: string = null;
	parameters: string = null;
	isPause: boolean = false;
	isSkip: boolean = false;
	maxErrorCount: number = null;
	description: string = null;
	workGroup: string = null;
	prevTriggerGuid: number = null;
}
