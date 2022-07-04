import { BaseModel } from "@core/_base/crud/models/_base.model";

export class ApiCallLogRequestDto extends BaseModel {
	guid: string = "";
	requestDateStart: Date = new Date();
	requestDateEnd: Date = new Date();
	requestKey: string = "";
	applicationName: string = "";
	actionName: string = "";
	apiRoute: string = "";
	request: string = "";
	userCode: string = "";
	menuGuid: string = "";
	channel: string = "";
	operatorId: string = "";
}
