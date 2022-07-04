import { BaseModel } from "@core/_base/crud";
import { MsnMessageTemplateTextModel } from "./msn-message-template-text-model";

export class MsnMessageTemplateDefModel extends BaseModel {
	lastUpdated: number = 1;
	code: number = 0;
	description: string = null;
	mailFrom: string = null;
	smsFrom: string = null;
	allowedMinSendTime: number = null;
	allowedMaxSendTime: number = null;
	type: string = null;
	msnMessageTemplateText: MsnMessageTemplateTextModel[] = [];
	isBodyHtml: boolean = false;
}
