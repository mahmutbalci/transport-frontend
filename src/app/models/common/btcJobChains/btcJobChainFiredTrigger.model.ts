export interface BtcJobChainFiredTriggerModel {
	guid: number;
	triggerGuid: number;
	uniqueKey: string;
	historyGuid: number;
	eodDate: Date;
	stat: string;
	startDateTime: Date;
	endDateTime: Date;
	duration: number;
	producedItemCount: number;
	processedCount: number;
	errorCount: number;
	errorCode: string;
	errorDscr: string;
}
