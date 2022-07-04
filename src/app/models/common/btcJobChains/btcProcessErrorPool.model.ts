export interface BtcProcessErrorPoolModel {
	guid: number;
	uniqueKey: string;
	chainGuid: number;
	triggerGuid: number;
	eodDate: Date;
	errorCode: string;
	errorDscr: string;
}
