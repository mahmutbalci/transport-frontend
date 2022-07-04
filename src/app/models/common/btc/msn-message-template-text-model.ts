import { BaseModel } from "@core/_base/crud";

export class MsnMessageTemplateTextModel extends BaseModel {
	guid: number = 0;
	memberId: number = 1;
	lastUpdated: number = 1;
	templateCode: number = 0;
	language: string = "";
	mailSubject: string = null;
	mailBody: string = null;
	mailBodyExt: string = null;
	smsBody: string = null;
}
