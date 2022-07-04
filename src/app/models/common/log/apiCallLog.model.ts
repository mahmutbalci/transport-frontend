import { BaseModel } from "@core/_base/crud/models/_base.model";

export class ApiCallLogModel extends BaseModel {
	guid: string = "";
	mbrId: number = 0;
	requestKey: string = "";
	applicationName: string = "";
	actionName: string = "";
	apiRoute: string = "";
	httpMethod: string = "";
	httpStatusCode: number = 0;
	version: string = "";
	direction: string = "";
	userCode: string = "";
	requestDate: Date = new Date();
	requestTime: string = "";
	elapsedMs: number = 0;
	channel: string = "";
	menuGuid: number = 0;
	eventName: string = "";
	deviceId: string = "";
	machineName: string = "";
	parentGuid: string = "";
	requestHeaders: string = "";
	request: string = "";
	response: string = "";
	sessionGuid: number = 0;
	exceptionCode: string = "";
}
